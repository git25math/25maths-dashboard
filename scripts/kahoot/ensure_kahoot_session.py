#!/usr/bin/env python3
"""Ensure the Kahoot creator session is logged in using a persistent Playwright profile.

This script is intended to be safe for agent-driven use:
- If already logged in, it exits quickly.
- If login is required and headless=False, it keeps the browser open and waits for the user to complete login.
- It does not require terminal stdin interaction.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

try:
    from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
    from playwright.sync_api import sync_playwright
except Exception as exc:  # noqa: BLE001
    print("ERROR: playwright is required. Install with: pip install playwright", file=sys.stderr)
    raise SystemExit(2) from exc

LOGIN_RE = re.compile(r"/auth/login|/login(?:$|[/?#])", re.I)
DISMISS_RE = re.compile(r"allow all|reject all|confirm choices|got it|skip|not now|允许|确认|跳过|稍后", re.I)
DEFAULT_USER_DATA_DIR = Path('/Users/zhuxingzhe/Project/ExamBoard/25maths-website/.cache/kahoot/playwright-profile')
DEFAULT_URL = 'https://create.kahoot.it/'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Ensure Kahoot creator login session is ready')
    parser.add_argument('--url', default=DEFAULT_URL, help='Target creator/details URL to verify against')
    parser.add_argument('--user-data-dir', default=str(DEFAULT_USER_DATA_DIR), help='Persistent Playwright profile dir')
    parser.add_argument('--timeout-sec', type=int, default=240, help='How long to wait for manual login')
    parser.add_argument('--headless', action='store_true', help='Run headless')
    parser.add_argument('--slow-mo', type=int, default=0, help='Playwright slow_mo in ms')
    parser.add_argument('--result', default='', help='Optional JSON output path')
    return parser.parse_args()


def is_login_url(url: str) -> bool:
    return bool(LOGIN_RE.search(url or ''))


def dismiss_overlays(page) -> None:
    for _ in range(4):
        try:
            buttons = page.get_by_role('button', name=DISMISS_RE)
            count = min(buttons.count(), 6)
            clicked = False
            for index in range(count):
                try:
                    buttons.nth(index).click(timeout=800, force=True)
                    clicked = True
                    page.wait_for_timeout(300)
                    break
                except Exception:  # noqa: BLE001
                    continue
            if not clicked:
                break
        except Exception:  # noqa: BLE001
            break


def write_result(path: str, payload: dict) -> None:
    if not path:
        return
    Path(path).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main() -> int:
    args = parse_args()
    user_data_dir = Path(args.user_data_dir).resolve()
    user_data_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        context = playwright.chromium.launch_persistent_context(
            user_data_dir=str(user_data_dir),
            headless=args.headless,
            slow_mo=args.slow_mo,
        )
        page = context.pages[0] if context.pages else context.new_page()

        try:
            page.goto(args.url, wait_until='domcontentloaded', timeout=90000)
            page.wait_for_timeout(1800)
            dismiss_overlays(page)

            if not is_login_url(page.url):
                payload = {
                    'ok': True,
                    'logged_in': True,
                    'manual_login_used': False,
                    'url': page.url,
                    'title': page.title(),
                    'message': 'Kahoot creator session is already logged in.',
                }
                write_result(args.result, payload)
                print(json.dumps(payload, ensure_ascii=False))
                context.close()
                return 0

            if args.headless:
                payload = {
                    'ok': False,
                    'logged_in': False,
                    'manual_login_used': False,
                    'url': page.url,
                    'title': page.title(),
                    'message': 'Login required, but headless mode cannot support manual login.',
                }
                write_result(args.result, payload)
                print(json.dumps(payload, ensure_ascii=False))
                context.close()
                return 1

            deadline = time.time() + max(args.timeout_sec, 15)
            print('Kahoot login required. Complete login in the opened browser window...')
            while time.time() < deadline:
                page.wait_for_timeout(1200)
                dismiss_overlays(page)
                try:
                    page.goto(args.url, wait_until='domcontentloaded', timeout=30000)
                except PlaywrightTimeoutError:
                    pass
                page.wait_for_timeout(1000)
                if not is_login_url(page.url):
                    payload = {
                        'ok': True,
                        'logged_in': True,
                        'manual_login_used': True,
                        'url': page.url,
                        'title': page.title(),
                        'message': 'Manual login completed and creator session is ready.',
                    }
                    write_result(args.result, payload)
                    print(json.dumps(payload, ensure_ascii=False))
                    context.close()
                    return 0

            payload = {
                'ok': False,
                'logged_in': False,
                'manual_login_used': True,
                'url': page.url,
                'title': page.title(),
                'message': f'Login was not completed within {args.timeout_sec} seconds.',
            }
            write_result(args.result, payload)
            print(json.dumps(payload, ensure_ascii=False))
            context.close()
            return 1
        finally:
            try:
                context.close()
            except Exception:  # noqa: BLE001
                pass


if __name__ == '__main__':
    raise SystemExit(main())
