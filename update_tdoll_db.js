const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const TARGET_URL = 'https://iopwiki.com/wiki/T-Doll_Index';

const TARGET_TEMP_DIR = path.join(__dirname, 'temp');
const SOURCE_HTML_NAME = 'index.html';
const DB_NAME = 'tdoll_db.json';

if (!fs.existsSync(TARGET_TEMP_DIR)) {
    fs.mkdirSync(TARGET_TEMP_DIR);
}

const getTdollInfo = (element) => {
    const _$1 = cheerio.load(element);

    const attributes = element.attributes;

    const dataOptions = _$1.root().data();

    console.log(attributes);
    console.log(dataOptions);

    const name = _$1('span.name').text();
    const index = parseInt(_$1('span.index').text().trim());

    const rarityStarsSrc = _$1('img.rarity-stars').attr('src');
    const rarityClassSrc = _$1('img.rarity-class').attr('src');

    let targetClass = '';
    if (rarityClassSrc.includes('SMG')) {
        targetClass = 'SMG';
    } else if (rarityClassSrc.includes('MG')) {
        targetClass = 'MG';
    } else if (rarityClassSrc.includes('AR')) {
        targetClass = 'AR';
    } else if (rarityClassSrc.includes('HG')) {
        targetClass = 'HG';
    } else if (rarityClassSrc.includes('RF')) {
        targetClass = 'RF';
    } else if (rarityClassSrc.includes('SG')) {
        targetClass = 'SG';
    }

    let targetStars = -1;
    if (rarityStarsSrc.includes('6star')) {
        targetStars = 6;
    } else if (rarityStarsSrc.includes('5star')) {
        targetStars = 5;
    } else if (rarityStarsSrc.includes('4star')) {
        targetStars = 4;
    }
    else if (rarityStarsSrc.includes('3star')) {
        targetStars = 3;
    }
    else if (rarityStarsSrc.includes('2star')) {
        targetStars = 2;
    }

    const resItem = {
        name,
        id: index,
        class: targetClass,
        star: targetStars
    };

    console.log('resItem', resItem);

    return resItem;
}

const saveDataToFile = (jsonData) => {
    fs.writeFileSync(path.join(__dirname, DB_NAME), JSON.stringify(jsonData, null, 2));
}

axios.get(TARGET_URL).then(res => {
    const htmlContent = res.data;

    // write to temp/index.html
    fs.writeFileSync(path.join(TARGET_TEMP_DIR, SOURCE_HTML_NAME), htmlContent);

    const $ = cheerio.load(htmlContent);

    const tdollList = $('span.card-bg-small');

    const jsonData = [];

    Array.from(tdollList).forEach(element => {
        const info = getTdollInfo(element);
        jsonData.push(info);
    });

    saveDataToFile(jsonData);

    console.log('Update tdoll db Completed.');
});