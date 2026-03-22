import type { Character } from '../types';

export const CHARACTERS: Character[] = [
  {
    id: 'caocao',
    name: { zh: '曹操', en: 'Cao Cao' },
    role: { zh: '魏武帝', en: 'Emperor of Wei' },
    image: './avatars/caocao.png',
    color: 'bg-blue-700',
    description: { zh: '宁教我负天下人，休教天下人负我。', en: 'I would rather betray the world than let the world betray me.' },
    skill: { zh: '【屯田】：答题速度越快，功勋加成越高。', en: '【Tuntian】: Faster answers earn higher merit bonus.' },
    stats: { power: 85, speed: 70, wisdom: 95 }
  },
  {
    id: 'liubei',
    name: { zh: '刘备', en: 'Liu Bei' },
    role: { zh: '汉昭烈帝', en: 'Emperor of Shu' },
    image: './avatars/liubei.png',
    color: 'bg-emerald-600',
    description: { zh: '惟贤惟德，能服于人。', en: 'Only virtue and wisdom can win the hearts of people.' },
    skill: { zh: '【仁德】：答错后获得额外鼓励提示。', en: '【Benevolence】: Extra encouragement hints after wrong answers.' },
    stats: { power: 75, speed: 65, wisdom: 90 }
  },
  {
    id: 'sunquan',
    name: { zh: '孙权', en: 'Sun Quan' },
    role: { zh: '吴大帝', en: 'Emperor of Wu' },
    image: './avatars/sunquan.png',
    color: 'bg-red-600',
    description: { zh: '坐断东南战未休。', en: 'Commanding the Southeast, the battle never ends.' },
    skill: { zh: '【制衡】：闯关时额外获得 1 点体力。', en: '【Balance】: Start challenges with 1 extra HP.' },
    stats: { power: 80, speed: 75, wisdom: 85 }
  },
  {
    id: 'guanyu',
    name: { zh: '关羽', en: 'Guan Yu' },
    role: { zh: '武圣', en: 'God of War' },
    image: './avatars/guanyu.png',
    color: 'bg-green-700',
    description: { zh: '千里走单骑，义薄云天。', en: 'Riding a thousand miles alone, loyalty reaching the heavens.' },
    skill: { zh: '【武圣】：连击加成提升更快。', en: '【Wusheng】: Combo bonus builds up faster.' },
    stats: { power: 100, speed: 80, wisdom: 60 }
  },
  {
    id: 'zhugeliang',
    name: { zh: '诸葛亮', en: 'Zhuge Liang' },
    role: { zh: '卧龙', en: 'Sleeping Dragon' },
    image: './avatars/zhugeliang.png',
    color: 'bg-purple-600',
    description: { zh: '运筹帷幄之中，决胜千里之外。', en: 'Planning within the tent, winning battles a thousand miles away.' },
    skill: { zh: '【观星】：练习模式看例题时显示额外解题思路。', en: '【Guanxing】: Extra solution insights during example viewing.' },
    stats: { power: 30, speed: 50, wisdom: 100 }
  },
  {
    id: 'diaochan',
    name: { zh: '貂蝉', en: 'Diao Chan' },
    role: { zh: '闭月', en: 'The Beauty' },
    image: './avatars/diaochan.png',
    color: 'bg-pink-500',
    description: { zh: '一点樱桃启绛唇，两行碎玉喷阳春。', en: 'Cherry lips and jade teeth, beauty that topples kingdoms.' },
    skill: { zh: '【离间】：闯关时答错提示更详细。', en: '【Divisive】: More detailed hints when answering wrong in challenges.' },
    stats: { power: 40, speed: 100, wisdom: 80 }
  }
];
