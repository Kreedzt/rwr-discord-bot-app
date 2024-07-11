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

const RARITY_STARS_PREFIX = 'doll-rarity-';
const RARITY_CLASS_PREFIX = 'doll-classification-';

const getTdollInfo = (element) => {
    const _$1 = cheerio.load(element);

    const attributes = element.attributes;


    let rarityStars = '';
    let rarityClass = '';
    
    attributes.forEach(attr => {
        if (attr.name === 'class') {
            const classVal = attr.value;

            const clsList = classVal.split(' ');

            clsList.forEach(cls => {
                if (cls.startsWith(RARITY_STARS_PREFIX)) {
                    rarityStars = cls.split(RARITY_STARS_PREFIX)[1];
                } else if (cls.startsWith(RARITY_CLASS_PREFIX)) {
                    rarityClass = cls.split(RARITY_CLASS_PREFIX)[1];
                }
            })
        }
    });

    const dataOptions = _$1.root().data();

    console.log(attributes);
    console.log(dataOptions);

    const name = _$1('span.name').text();
    const index = parseInt(_$1('span.index').text().trim());

    const resItem = {
        name,
        id: isNaN(index) ? -1 : index,
        class: rarityClass,
        star: rarityStars
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

    const tdollList = $('.gfl-doll-card');

    const jsonData = [];

    Array.from(tdollList).forEach(element => {
        const info = getTdollInfo(element);
        jsonData.push(info);
    });

    saveDataToFile(jsonData);

    console.log('Update tdoll db Completed.');
});
