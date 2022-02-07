// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import type { NextApiRequest, NextApiResponse } from 'next';

interface SkillSetParams {
    userId: string,
    skillSetSlug: string,
}


interface UserSkill {
    name: string,
    id: string,
    currentLevel: number
}


const db: any = {
    '1': {
        userId: '1',
        skillList: {
            '1': [
                {
                    id: 'copy',
                    name: 'CopyWriter',
                    currentLevel: 0,
                },
                {
                    id: 'wd',
                    name: 'WebDesign',
                    currentLevel: 0,
                },
                {
                    id: 'seo',
                    name: 'SEO',
                    currentLevel: 40,
                }, {
                    id: 'js',
                    name: 'JavasScript',
                    currentLevel: 100,
                }, {
                    id: 'html',
                    name: 'HTML',
                    currentLevel: 80,
                }, {
                    id: 'css',
                    name: 'CSS',
                    currentLevel: 60,
                }, {
                    id: 'SM',
                    name: 'Scrum Master',
                    currentLevel: 10,
                }, {
                    id: 'PO',
                    name: 'Product owner',
                    currentLevel: 0,
                },
            ],
        },
    },
};

function stringToColour(str: string): string {
    var hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

function pickTextColorBasedOnBgColorSimple(bgColor: string, lightColor: string, darkColor: string) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
        darkColor : lightColor;
}

function drawSkillBars(ctx: CanvasRenderingContext2D, skillList: UserSkill[]) {

    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const padding = 3;
    const barWidth = (ctx.canvas.width - padding) / skillList.length;
    const barHeight = ctx.canvas.height / 100;
    skillList.forEach((skill, position) => {
        const color = stringToColour(skill.id);
        ctx.fillStyle = color;
        const left = position * barWidth + padding;
        const top = (100 - skill.currentLevel) * barHeight + padding;
        ctx.fillRect(
            left,
            top,
            barWidth - padding,
            skill.currentLevel * barHeight - (padding * 2),
        );

        ctx.font = '30px Impact';
        ctx.textAlign = 'center';
        ctx.fillStyle = pickTextColorBasedOnBgColorSimple(color, '#fff', '#000');
        ctx.fillText(skill.id, left + barWidth / 2, ctx.canvas.height - 3 - 10);
        ctx.fillText(skill.currentLevel.toString(), left + barWidth / 2, top + 30);
    });
    ctx.fillStyle = 'white';
    ctx.textAlign = 'start';
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const {
        userId,
        skillSetSlug,
    } = req.query as any as SkillSetParams;
    const [, skillSetId] = skillSetSlug.match(/^(\d+)\.(.*?)$/) || [];
    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext('2d');
    drawSkillBars(ctx, db[userId].skillList[skillSetId]);
    const stream = canvas.createJPEGStream({
        quality: 95,
    });
    res.on('finish', () => {
        console.log('stream finished');
    });
    stream.pipe(res);
}
