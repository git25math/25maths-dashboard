#!/usr/bin/env python3
"""Create or capture a Kahoot challenge link from a details/creator page.

The flow follows Kahoot's documented assignment flow on the details page:
- open the kahoot details page
- click Assign
- click Create
- capture the generated challenge link

If selectors fail and manual fallback is allowed, the script keeps the browser open
and watches for the challenge URL while the operator completes the flow manually.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from typing import Any

try:
    from playwright.sync_api import Error as PlaywrightError
    from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
    from playwright.sync_api import sync_playwright
except Exception as exc:  # noqa: BLE001
    print("ERROR: playwright is required. Install with: pip install playwright", file=sys.stderr)
    raise SystemExit(2) from exc

DEFAULT_USER_DATA_DIR = Path('/Users/zhuxingzhe/Project/ExamBoard/25maths-website/.cache/kahoot/playwright-profile')
LOGIN_RE = re.compile(r"/auth/login|/login(?:$|[/?#])", re.I)
ASSIGN_RE = re.compile(r"assign|challenge|self-paced|布置|挑战|作业", re.I)
CREATE_RE = re.compile(r"^create$|create|生成|创建|done|share|完成", re.I)
COPY_RE = re.compile(r"copy|复制", re.I)
DISMISS_RE = re.compile(r"allow all|reject all|confirm choices|got it|skip|not now|允许|确认|跳过|稍后", re.I)
CHALLENGE_URL_RE = re.compile(r"https://kahoot\.it/challenge/[A-Za-z0-9]+", re.I)
PIN_ONLY_RE = re.compile(r"\b([0-9]{6,12})\b")
CHALLENGE_ENDPOINT_RE = re.compile(r"/rest/challenges|/challenge/|/assign", re.I)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Create and capture a Kahoot challenge link')
    parser.add_argument('--detail-url', default='', help='Preferred Kahoot details URL')
    parser.add_argument('--creator-url', default='', help='Fallback creator URL')
    parser.add_argument('--kahoot-name', default='', help='Kahoot title for logs')
    parser.add_argument('--user-data-dir', default=str(DEFAULT_USER_DATA_DIR), help='Persistent Playwright profile dir')
    parser.add_argument('--timeout-sec', type=int, default=240, help='Maximum wait time for link generation')
    parser.add_argument('--headless', action='store_true', help='Run browser headless')
    parser.add_argument('--no-manual-fallback', action='store_true', help='Do not allow manual interaction fallback')
    parser.add_argument('--slow-mo', type=int, default=250, help='Playwright slow_mo in ms')
    parser.add_argument('--result', default='', help='Optional JSON output path')
    parser.add_argument('--screenshot', default='', help='Optional screenshot output path')
    return parser.parse_args()


def is_login_url(url: str) -> bool:
    return bool(LOGIN_RE.search(url or ''))


def write_result(path: str, payload: dict[str, Any]) -> None:
    if not path:
        return
    Path(path).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def click_first_available(page, candidates: list[Any], timeout_ms: int = 2500, force: bool = False) -> bool:
    for builder in candidates:
        try:
            locator = builder(page)
            count = locator.count()
            if count == 0:
                continue
            for index in range(min(count, 8)):
                try:
                    locator.nth(index).click(timeout=timeout_ms, force=force)
                    return True
                except (PlaywrightTimeoutError, PlaywrightError):
                    continue
        except (PlaywrightTimeoutError, PlaywrightError):
            continue
    return False


def dismiss_overlays(page) -> None:
    candidates = [
        lambda p: p.get_by_role('button', name=DISMISS_RE),
        lambda p: p.get_by_text(DISMISS_RE),
    ]
    for _ in range(4):
        if not click_first_available(page, candidates, timeout_ms=900, force=True):
            break
        page.wait_for_timeout(250)


def capture_challenge_from_value(value: str) -> str:
    if not value:
        return ''
    match = CHALLENGE_URL_RE.search(value)
    if match:
        return match.group(0)
    return ''


def extract_challenge_from_payload(payload: Any) -> str:
    if isinstance(payload, str):
        direct = capture_challenge_from_value(payload)
        if direct:
            return direct
        if 'kahoot.it/challenge/' not in payload:
            pin_match = PIN_ONLY_RE.search(payload)
            if pin_match:
                return f'https://kahoot.it/challenge/{pin_match.group(1)}'
        return ''

    if isinstance(payload, dict):
        for key, value in payload.items():
            if isinstance(value, (dict, list)):
                nested = extract_challenge_from_payload(value)
                if nested:
                    return nested
            elif isinstance(value, str):
                direct = capture_challenge_from_value(value)
                if direct:
                    return direct
                if key.lower() in {'pin', 'challengepin', 'pinvalue'} and value.strip():
                    return f'https://kahoot.it/challenge/{value.strip()}'
        return ''

    if isinstance(payload, list):
        for item in payload:
            nested = extract_challenge_from_payload(item)
            if nested:
                return nested

    return ''


def extract_challenge_from_dom(page) -> str:
    try:
        values = page.eval_on_selector_all(
            '[href], input, textarea, [data-functional-selector], [role="dialog"]',
            """
            els => els.flatMap(el => {
              const items = [];
              if (el instanceof HTMLAnchorElement && el.href) items.push(el.href);
              if ('value' in el && typeof el.value === 'string' && el.value) items.push(el.value);
              if (el.textContent) items.push(el.textContent);
              return items;
            })
            """,
        )
    except Exception:  # noqa: BLE001
        values = []

    for value in values:
        direct = capture_challenge_from_value(str(value))
        if direct:
            return direct

    try:
        text = page.content()
        direct = capture_challenge_from_value(text)
        if direct:
            return direct
    except Exception:  # noqa: BLE001
        pass

    try:
        page.context.grant_permissions(['clipboard-read', 'clipboard-write'], origin='https://create.kahoot.it')
        copied = page.evaluate(
            """
            async () => {
              try {
                return await navigator.clipboard.readText();
              } catch (error) {
                return '';
              }
            }
            """
        )
        direct = capture_challenge_from_value(str(copied))
        if direct:
            return direct
    except Exception:  # noqa: BLE001
        pass

    return ''


def click_assign(page) -> bool:
    candidates = [
        lambda p: p.get_by_role('button', name=ASSIGN_RE),
        lambda p: p.get_by_role('link', name=ASSIGN_RE),
        lambda p: p.get_by_text(ASSIGN_RE),
    ]
    return click_first_available(page, candidates, timeout_ms=3500, force=True)


def click_create(page) -> bool:
    candidates = [
        lambda p: p.get_by_role('dialog').get_by_role('button', name=CREATE_RE),
        lambda p: p.locator('[role="dialog"] button').filter(has_text=CREATE_RE),
        lambda p: p.get_by_role('button', name=CREATE_RE),
        lambda p: p.get_by_text(CREATE_RE),
    ]
    return click_first_available(page, candidates, timeout_ms=3500, force=True)


def click_copy(page) -> bool:
    candidates = [
        lambda p: p.get_by_role('button', name=COPY_RE),
        lambda p: p.get_by_text(COPY_RE),
    ]
    return click_first_available(page, candidates, timeout_ms=1800, force=True)


def wait_for_challenge(page, state: dict[str, str], timeout_sec: int) -> str:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        if state.get('challenge_url'):
            return state['challenge_url']

        dismiss_overlays(page)
        if click_copy(page):
            page.wait_for_timeout(300)

        challenge = extract_challenge_from_dom(page)
        if challenge:
            state['challenge_url'] = challenge
            return challenge

        page.wait_for_timeout(900)
    return ''


def maybe_wait_for_login(page, allow_manual_fallback: bool, timeout_sec: int) -> bool:
    if not is_login_url(page.url):
        return True
    if not allow_manual_fallback or page.context.browser is None:
        return False

    deadline = time.time() + timeout_sec
    print('Kahoot login required. Complete login in the opened browser window...')
    while time.time() < deadline:
        page.wait_for_timeout(1200)
        dismiss_overlays(page)
        if not is_login_url(page.url):
            return True
    return False


def main() -> int:
    args = parse_args()
    target_url = args.detail_url or args.creator_url
    if not target_url:
        raise SystemExit('ERROR: detail-url or creator-url is required')

    user_data_dir = Path(args.user_data_dir).resolve()
    user_data_dir.mkdir(parents=True, exist_ok=True)
    allow_manual_fallback = not args.no_manual_fallback and not args.headless

    state: dict[str, str] = {'challenge_url': ''}

    with sync_playwright() as playwright:
        context = playwright.chromium.launch_persistent_context(
            user_data_dir=str(user_data_dir),
            headless=args.headless,
            slow_mo=args.slow_mo,
        )
        page = context.pages[0] if context.pages else context.new_page()
        context.grant_permissions(['clipboard-read', 'clipboard-write'], origin='https://create.kahoot.it')

        def handle_response(response) -> None:
            url = response.url or ''
            if not CHALLENGE_ENDPOINT_RE.search(url):
                return
            try:
                payload = response.json()
            except Exception:  # noqa: BLE001
                try:
                    payload = response.text()
                except Exception:  # noqa: BLE001
                    payload = ''
            challenge = extract_challenge_from_payload(payload)
            if challenge:
                state['challenge_url'] = challenge

        page.on('response', handle_response)

        try:
            page.goto(target_url, wait_until='domcontentloaded', timeout=90000)
            page.wait_for_timeout(2200)
            dismiss_overlays(page)

            if not maybe_wait_for_login(page, allow_manual_fallback=allow_manual_fallback, timeout_sec=min(args.timeout_sec, 240)):
                payload = {
                    'ok': False,
                    'challenge_url': '',
                    'message': 'Kahoot creator login is required before creating a challenge link.',
                    'url': page.url,
                    'title': page.title(),
                    'manual_fallback_used': False,
                }
                write_result(args.result, payload)
                print(json.dumps(payload, ensure_ascii=False))
                return 1

            if is_login_url(page.url):
                page.goto(target_url, wait_until='domcontentloaded', timeout=90000)
                page.wait_for_timeout(1600)
                dismiss_overlays(page)

            auto_assign_clicked = click_assign(page)
            if auto_assign_clicked:
                page.wait_for_timeout(1200)
                dismiss_overlays(page)

            auto_create_clicked = click_create(page)
            if auto_create_clicked:
                page.wait_for_timeout(1200)

            challenge_url = wait_for_challenge(page, state, timeout_sec=30)
            manual_fallback_used = False

            if not challenge_url and allow_manual_fallback:
                manual_fallback_used = True
                print('Automatic challenge creation did not return a link yet. Complete the assign/create flow manually in the browser window...')
                challenge_url = wait_for_challenge(page, state, timeout_sec=max(args.timeout_sec - 30, 30))

            if args.screenshot:
                try:
                    page.screenshot(path=args.screenshot, full_page=True, timeout=12000)
                except Exception:  # noqa: BLE001
                    pass

            payload = {
                'ok': bool(challenge_url),
                'challenge_url': challenge_url,
                'url': page.url,
                'title': page.title(),
                'auto_assign_clicked': auto_assign_clicked,
                'auto_create_clicked': auto_create_clicked,
                'manual_fallback_used': manual_fallback_used,
                'message': 'Challenge link captured.' if challenge_url else 'Challenge link was not captured.',
            }
            write_result(args.result, payload)
            print(json.dumps(payload, ensure_ascii=False))
            return 0 if challenge_url else 1
        finally:
            try:
                context.close()
            except Exception:  # noqa: BLE001
                pass


if __name__ == '__main__':
    raise SystemExit(main())
