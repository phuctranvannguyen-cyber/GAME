/* =========================================================
   CYBERARENA
   GAME ENGINE - FROM ZERO
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const DIFFICULTIES = {

    easy: {
        name: "DỄ",

        enemyHp: 35,

        enemySpeed: 0.75,

        enemyDamage: 7,

        bossMultiplier: 3,

        dropBonus: 0
    },

    normal: {
        name: "BÌNH THƯỜNG",

        enemyHp: 50,

        enemySpeed: 0.95,

        enemyDamage: 10,

        bossMultiplier: 4,

        dropBonus: 4
    },

    hard: {
        name: "KHÓ",

        enemyHp: 70,

        enemySpeed: 1.2,

        enemyDamage: 14,

        bossMultiplier: 5,

        dropBonus: 8
    }

};


/* =========================================================
   DROP ITEMS
========================================================= */

const ITEMS = [

    {
        id: "bomb",
        name: "BOM",
        short: "💣",
        weight: 8,
        color: "#ff3355"
    },

    {
        id: "rocket",
        name: "TÊN LỬA",
        short: "🚀",
        weight: 8,
        color: "#ff7700"
    },

    {
        id: "clear",
        name: "QUÉT SẠCH",
        short: "☠",
        weight: 4,
        color: "#ffffff"
    },

    {
        id: "speed",
        name: "TĂNG TỐC",
        short: "⚡",
        weight: 12,
        color: "#00ff88"
    },

    {
        id: "rapid",
        name: "TĂNG TỐC BẮN",
        short: "🔥",
        weight: 16,
        color: "#00ffff"
    },

    {
        id: "double",
        name: "2 ĐẠN",
        short: "Ⅱ",
        weight: 12,
        color: "#66ffff"
    },

    {
        id: "triple",
        name: "3 ĐẠN",
        short: "Ⅲ",
        weight: 8,
        color: "#aa66ff"
    },

    {
        id: "ultra",
        name: "ULTRA GUN",
        short: "UG",
        weight: 7,
        color: "#ff00ff"
    },

    {
        id: "thunder",
        name: "SẤM SÉT",
        short: "⚡",
        weight: 9,
        color: "#ffff00"
    },

    {
        id: "fire",
        name: "LỬA",
        short: "🔥",
        weight: 7,
        color: "#ff5500"
    },

    {
        id: "ice",
        name: "BĂNG",
        short: "❄",
        weight: 7,
        color: "#66ddff"
    }

];


/* =========================================================
   DOM
========================================================= */

const startScreen =
    document.getElementById("startScreen");

const game =
    document.getElementById("game");

const arena =
    document.getElementById("arena");

const playerEl =
    document.getElementById("player");

const petEl =
    document.getElementById("pet");

const effectsEl =
    document.getElementById("effects");

const messageEl =
    document.getElementById("message");

const gameOverEl =
    document.getElementById("gameOver");

const victoryEl =
    document.getElementById("victory");

const bossContainer =
    document.getElementById("bossContainer");

const bossHpEl =
    document.getElementById("bossHp");


/* =========================================================
   GAME STATE
========================================================= */

let difficulty = "normal";

let stage = 1;

let score = 0;

let combo = 1;

let gameRunning = false;

let stageCleared = false;

let bossSpawned = false;

let boss = null;

let enemies = [];

let bullets = [];

let drops = [];

let particles = [];

let keys = {};

let lastTime = 0;

let spawnTimer = 0;

let shootTimer = 0;

let petShootTimer = 0;

let messageTimer = null;


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 0,

    y: 0,

    width: 54,

    height: 68,

    speed: 4.8,

    hp: 100,

    maxHp: 100,

    damage: 12,

    fireRate: 420,

    projectileCount: 1,

    speedMultiplier: 1,

    element: null,

    hasPet: false

};


/* =========================================================
   DIFFICULTY BUTTONS
========================================================= */

document
    .querySelectorAll(".difficulty-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".difficulty-btn")
                    .forEach(btn =>
                        btn.classList.remove("selected")
                    );

                button.classList.add("selected");

                difficulty =
                    button.dataset.difficulty;

            }
        );

    });


/* =========================================================
   START GAME
========================================================= */

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        startGame
    );


function startGame() {

    startScreen.classList.add("hidden");

    game.classList.remove("hidden");

    gameRunning = true;

    stage = 1;

    score = 0;

    combo = 1;

    player.hp = 100;

    player.maxHp = 100;

    player.damage = 12;

    player.fireRate = 420;

    player.projectileCount = 1;

    player.speedMultiplier = 1;

    player.element = null;

    player.hasPet = false;

    petEl.classList.add("hidden");

    player.x =
        arena.clientWidth / 2;

    player.y =
        arena.clientHeight * .78;

    playerEl.style.left =
        `${player.x}px`;

    playerEl.style.top =
        `${player.y}px`;

    clearAll();

    updateHUD();

    showMessage(
        "⚡ CYBERARENA ONLINE"
    );

    setTimeout(() => {

        startStage();

    }, 1200);

    lastTime =
        performance.now();

    requestAnimationFrame(loop);
}


/* =========================================================
   START STAGE
========================================================= */

function startStage() {

    stageCleared = false;

    bossSpawned = false;

    boss = null;

    bossContainer.classList.add("hidden");

    clearEnemies();

    showMessage(
        `STAGE ${stage} / 5`
    );

    /*
       Stage 5 = boss stage
    */

    if (stage === 5) {

        setTimeout(
            spawnBoss,
            1200
        );

        return;
    }

    /*
       Mỗi stage có lượng quái khác nhau
    */

    const amount =
        6 + stage * 2;

    for (let i = 0; i < amount; i++) {

        setTimeout(
            () => {

                if (gameRunning) {
                    spawnEnemy();
                }

            },
            i * Math.max(
                250,
                800 - stage * 100
            )
        );

    }

}


/* =========================================================
   SPAWN NORMAL ENEMY
========================================================= */

function spawnEnemy() {

    if (!gameRunning) return;

    const config =
        DIFFICULTIES[difficulty];

    const enemy = {

        type: "normal",

        x:
            45 +
            Math.random() *
            (arena.clientWidth - 90),

        y: -50,

        size:
            36 +
            Math.random() * 12,

        hp:
            config.enemyHp *
            (1 + (stage - 1) * .12),

        maxHp:
            config.enemyHp *
            (1 + (stage - 1) * .12),

        speed:
            config.enemySpeed *
            (1 + (stage - 1) * .10),

        damage:
            config.enemyDamage,

        el: null

    };


    const el =
        document.createElement("div");

    el.className =
        "enemy";

    el.style.width =
        `${enemy.size}px`;

    el.style.height =
        `${enemy.size}px`;

    el.innerHTML = `
        <div class="enemy-core"></div>
    `;

    arena.appendChild(el);

    enemy.el = el;

    enemies.push(enemy);
}


/* =========================================================
   SPAWN BOSS
========================================================= */

function spawnBoss() {

    if (!gameRunning) return;

    bossSpawned = true;

    const config =
        DIFFICULTIES[difficulty];

    const normalHp =
        config.enemyHp *
        (1 + (stage - 1) * .12);

    boss = {

        type: "boss",

        x:
            arena.clientWidth / 2,

        y: -90,

        size: 105,

        hp:
            normalHp *
            config.bossMultiplier,

        maxHp:
            normalHp *
            config.bossMultiplier,

        speed:
            config.enemySpeed * .45,

        el: null

    };


    const el =
        document.createElement("div");

    el.className =
        "boss";

    el.innerHTML = `

        <div class="boss-horn left"></div>

        <div class="boss-horn right"></div>

        <div class="boss-body">

            <div class="boss-eye left"></div>

            <div class="boss-eye right"></div>

            <div class="boss-mouth"></div>

        </div>
    `;

    arena.appendChild(el);

    boss.el = el;

    bossContainer.classList.remove("hidden");

    showMessage(
        "☠ CYBER DEMON ĐÃ XUẤT HIỆN"
    );
}


/* =========================================================
   MOVEMENT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;

    }
);


document.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        keys[key] = false;

    }
);


/* =========================================================
   MOBILE MOVEMENT BUTTONS
========================================================= */

document
    .querySelectorAll(".move-btn")
    .forEach(button => {

        const key =
            button.dataset.key;

        button.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                keys[key] = true;

            }
        );

        button.addEventListener(
            "pointerup",
            () => {

                keys[key] = false;

            }
        );

        button.addEventListener(
            "pointerleave",
            () => {

                keys[key] = false;

            }
        );

    });


function updatePlayer(delta) {

    let speed =
        player.speed *
        player.speedMultiplier;

    /*
       SHIFT = boost
    */

    if (keys["shift"]) {
        speed *= 1.35;
    }

    if (
        keys["arrowleft"] ||
        keys["a"]
    ) {
        player.x -= speed * delta;
    }

    if (
        keys["arrowright"] ||
        keys["d"]
    ) {
        player.x += speed * delta;
    }

    if (
        keys["arrowup"] ||
        keys["w"]
    ) {
        player.y -= speed * delta;
    }

    if (
        keys["arrowdown"] ||
        keys["s"]
    ) {
        player.y += speed * delta;
    }


    const margin = 30;

    player.x =
        Math.max(
            margin,
            Math.min(
                arena.clientWidth - margin,
                player.x
            )
        );

    player.y =
        Math.max(
            70,
            Math.min(
                arena.clientHeight - 40,
                player.y
            )
        );


    playerEl.style.left =
        `${player.x}px`;

    playerEl.style.top =
        `${player.y}px`;
}


/* =========================================================
   AUTO SHOOT
========================================================= */

function autoShoot(time) {

    if (
        time - shootTimer <
        player.fireRate
    ) {
        return;
    }

    shootTimer = time;

    if (
        player.projectileCount === 1
    ) {

        fireBullet(
            player.x,
            player.y - 35,
            0
        );

    }

    else if (
        player.projectileCount === 2
    ) {

        fireBullet(
            player.x - 12,
            player.y - 28,
            -.08
        );

        fireBullet(
            player.x + 12,
            player.y - 28,
            .08
        );

    }

    else {

        fireBullet(
            player.x,
            player.y - 35,
            0
        );

        fireBullet(
            player.x - 15,
            player.y - 27,
            -.12
        );

        fireBullet(
            player.x + 15,
            player.y - 27,
            .12
        );

    }

}


/* =========================================================
   BULLET
========================================================= */

function fireBullet(
    x,
    y,
    angle
) {

    const el =
        document.createElement("div");

    el.className =
        "bullet";

    /*
       Element colors
    */

    if (player.element === "fire") {

        el.style.background = "#ff5500";

        el.style.boxShadow =
            "0 0 10px #ff5500";

    }

    if (player.element === "ice") {

        el.style.background = "#66ddff";

        el.style.boxShadow =
            "0 0 10px #66ddff";

    }

    if (player.element === "thunder") {

        el.style.background = "#ffff00";

        el.style.boxShadow =
            "0 0 10px #ffff00";

    }

    arena.appendChild(el);


    bullets.push({

        x,

        y,

        vx:
            Math.sin(angle) * 7,

        vy:
            -10,

        damage:
            player.damage,

        el

    });

}


/* =========================================================
   UPDATE BULLETS
========================================================= */

function updateBullets(delta) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.x +=
            bullet.vx * delta;

        bullet.y +=
            bullet.vy * delta;


        bullet.el.style.left =
            `${bullet.x}px`;

        bullet.el.style.top =
            `${bullet.y}px`;


        let hit = false;


        /*
           Boss collision
        */

        if (
            boss &&
            boss.el &&
            distance(
                bullet,
                boss
            ) < 60
        ) {

            damageBoss(
                bullet.damage
            );

            removeBullet(i);

            hit = true;
        }


        if (hit) continue;


        /*
           Normal enemy collision
        */

        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy =
                enemies[j];

            if (
                distance(
                    bullet,
                    enemy
                ) < enemy.size / 2 + 7
            ) {

                damageEnemy(
                    enemy,
                    bullet.damage
                );

                removeBullet(i);

                hit = true;

                break;
            }

        }


        if (
            !hit &&
            (
                bullet.y < -50 ||
                bullet.x < -50 ||
                bullet.x >
                    arena.clientWidth + 50
            )
        ) {

            removeBullet(i);

        }

    }

}


/* =========================================================
   DAMAGE ENEMY
========================================================= */

function damageEnemy(
    enemy,
    damage
) {

    enemy.hp -= damage;

    createHit(
        enemy.x,
        enemy.y,
        "#ff00aa"
    );


    if (enemy.hp <= 0) {

        score +=
            Math.round(
                10 * combo
            );

        combo =
            Math.min(
                5,
                combo + .15
            );


        /*
           Drop
        */

        tryDrop(
            enemy.x,
            enemy.y
        );


        /*
           Destroy
        */

        enemy.el.remove();

        const index =
            enemies.indexOf(enemy);

        if (index !== -1) {
            enemies.splice(
                index,
                1
            );
        }

    }

}


/* =========================================================
   DAMAGE BOSS
========================================================= */

function damageBoss(damage) {

    if (!boss) return;

    boss.hp -= damage;

    createHit(
        boss.x,
        boss.y,
        "#ff0055"
    );


    bossHpEl.style.width =
        `${Math.max(
            0,
            boss.hp /
            boss.maxHp *
            100
        )}%`;


    if (boss.hp <= 0) {

        defeatBoss();

    }

}


/* =========================================================
   DEFEAT BOSS
========================================================= */

function defeatBoss() {

    if (!boss) return;

    createExplosion(
        boss.x,
        boss.y,
        "#ff0055"
    );


    score +=
        1000 * stage;


    boss.el.remove();

    boss = null;

    bossContainer.classList.add(
        "hidden"
    );


    /*
       PET:
       EASY + NORMAL
    */

    if (
        (
            difficulty === "easy" ||
            difficulty === "normal"
        ) &&
        !player.hasPet
    ) {

        player.hasPet = true;

        petEl.classList.remove(
            "hidden"
        );

        showMessage(
            "🐾 PET ĐÃ THAM GIA!"
        );

    } else {

        showMessage(
            "☠ BOSS DESTROYED"
        );

    }


    setTimeout(
        nextStage,
        2200
    );

}


/* =========================================================
   NEXT STAGE
========================================================= */

function nextStage() {

    if (!gameRunning) return;

    if (stage >= 5) {

        victory();

        return;
    }

    stage++;

    combo = 1;

    clearEnemies();

    startStage();

}


/* =========================================================
   DROP CHANCE
========================================================= */

function getDropChance() {

    /*
       Không cho rơi quá nhiều.

       Stage 1:
       khoảng 15%

       Stage 2:
       khoảng 18%

       Stage 3:
       khoảng 21%

       Stage 4:
       khoảng 24%

       Stage 5:
       không có quái thường
    */

    const config =
        DIFFICULTIES[difficulty];

    return (
        15 +
        (stage - 1) * 3 +
        config.dropBonus
    );

}


/* =========================================================
   TRY DROP
========================================================= */

function tryDrop(
    x,
    y
) {

    const chance =
        getDropChance();


    if (
        Math.random() * 100 >
        chance
    ) {
        return;
    }


    const item =
        weightedRandomItem();


    createDrop(
        x,
        y,
        item
    );

}


/* =========================================================
   WEIGHTED RANDOM ITEM
========================================================= */

function weightedRandomItem() {

    const total =
        ITEMS.reduce(
            (
                sum,
                item
            ) =>
                sum + item.weight,
            0
        );


    let random =
        Math.random() *
        total;


    for (
        const item of ITEMS
    ) {

        random -=
            item.weight;

        if (random <= 0) {

            return item;

        }

    }


    return ITEMS[0];

}


/* =========================================================
   CREATE DROP
========================================================= */

function createDrop(
    x,
    y,
    item
) {

    const el =
        document.createElement("div");

    el.className =
        "drop";

    el.style.color =
        item.color;

    el.style.left =
        `${x}px`;

    el.style.top =
        `${y}px`;

    el.innerHTML = `
        ${item.short}
    `;

    arena.appendChild(el);


    drops.push({

        x,

        y,

        item,

        life: 7000,

        el

    });

}


/* =========================================================
   UPDATE DROPS
========================================================= */

function updateDrops(delta) {

    for (
        let i = drops.length - 1;
        i >= 0;
        i--
    ) {

        const drop =
            drops[i];


        drop.life -=
            delta * 16;


        drop.y +=
            Math.sin(
                performance.now() / 180
            ) * .2;


        drop.el.style.left =
            `${drop.x}px`;

        drop.el.style.top =
            `${drop.y}px`;


        if (
            distance(
                drop,
                player
            ) < 40
        ) {

            collectItem(
                drop.item
            );

            drop.el.remove();

            drops.splice(
                i,
                1
            );

            continue;
        }


        if (
            drop.life <= 0
        ) {

            drop.el.remove();

            drops.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   COLLECT ITEM
========================================================= */

function collectItem(item) {

    showMessage(
        `${item.short} ${item.name}`
    );


    switch (item.id) {


        /* =====================
           BOMB
        ===================== */

        case "bomb":

            enemies.forEach(
                enemy => {

                    enemy.hp -= 60;

                }
            );

            if (boss) {

                boss.hp -= 100;

            }

            createExplosion(
                player.x,
                player.y,
                "#ff3355"
            );

            break;


        /* =====================
           ROCKET
        ===================== */

        case "rocket":

            enemies.forEach(
                enemy => {

                    enemy.hp -= 100;

                }
            );

            if (boss) {

                boss.hp -= 180;

            }

            createExplosion(
                player.x,
                player.y,
                "#ff7700"
            );

            break;


        /* =====================
           CLEAR
        ===================== */

        case "clear":

            enemies
                .slice()
                .forEach(
                    enemy => {

                        enemy.hp = 0;

                        destroyEnemy(
                            enemy
                        );

                    }
                );

            createExplosion(
                arena.clientWidth / 2,
                arena.clientHeight / 2,
                "#ffffff"
            );

            break;


        /* =====================
           SPEED
        ===================== */

        case "speed":

            player.speedMultiplier =
                1.7;

            setTimeout(
                () => {

                    player.speedMultiplier =
                        1;

                },
                7000
            );

            break;


        /* =====================
           RAPID FIRE
        ===================== */

        case "rapid":

            player.fireRate *= .55;

            setTimeout(
                () => {

                    player.fireRate /=
                        .55;

                },
                8000
            );

            break;


        /* =====================
           DOUBLE
        ===================== */

        case "double":

            player.projectileCount =
                Math.max(
                    2,
                    player.projectileCount
                );

            break;


        /* =====================
           TRIPLE
        ===================== */

        case "triple":

            player.projectileCount = 3;

            break;


        /* =====================
           ULTRA
        ===================== */

        case "ultra":

            player.damage += 20;

            player.fireRate *= .72;

            player.projectileCount = 3;

            break;


        /* =====================
           THUNDER
        ===================== */

        case "thunder":

            player.element =
                "thunder";

            player.damage += 25;

            break;


        /* =====================
           FIRE
        ===================== */

        case "fire":

            player.element =
                "fire";

            player.damage += 20;

            break;


        /* =====================
           ICE
        ===================== */

        case "ice":

            player.element =
                "ice";

            player.damage += 18;

            break;

    }


    addSkillChip(item);

}


/* =========================================================
   ACTIVE SKILL UI
========================================================= */

function addSkillChip(item) {

    const list =
        document.getElementById(
            "skillsList"
        );


    const chip =
        document.createElement("div");

    chip.className =
        "skill-chip";

    chip.style.color =
        item.color;

    chip.title =
        item.name;

    chip.textContent =
        item.short;


    list.appendChild(chip);

}


/* =========================================================
   UPDATE ENEMIES
========================================================= */

function updateEnemies(delta) {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];


        enemy.y +=
            enemy.speed * delta;


        /*
           Một chút di chuyển ngang
        */

        enemy.x +=
            Math.sin(
                performance.now() / 500 +
                i
            ) *
            .25 *
            delta;


        enemy.el.style.left =
            `${enemy.x}px`;

        enemy.el.style.top =
            `${enemy.y}px`;


        /*
           Chạm player
        */

        if (
            distance(
                enemy,
                player
            ) <
            enemy.size / 2 + 20
        ) {

            damagePlayer(
                enemy.damage
            );

            destroyEnemy(
                enemy
            );

            continue;

        }


        /*
           Enemy thoát khỏi màn hình
        */

        if (
            enemy.y >
            arena.clientHeight + 60
        ) {

            damagePlayer(4);

            destroyEnemy(
                enemy
            );

        }

    }

}


/* =========================================================
   UPDATE BOSS
========================================================= */

function updateBoss(delta) {

    if (!boss) return;


    if (
        boss.y <
        arena.clientHeight * .22
    ) {

        boss.y +=
            boss.speed * delta;

    } else {

        /*
           Boss di chuyển ngang
        */

        boss.x +=
            Math.sin(
                performance.now() / 700
            ) *
            .9 *
            delta;

    }


    /*
       Giới hạn boss
    */

    boss.x =
        Math.max(
            80,
            Math.min(
                arena.clientWidth - 80,
                boss.x
            )
        );


    boss.el.style.left =
        `${boss.x}px`;

    boss.el.style.top =
        `${boss.y}px`;


    /*
       Boss chạm player
    */

    if (
        distance(
            boss,
            player
        ) < 75
    ) {

        damagePlayer(25);

    }


    bossHpEl.style.width =
        `${Math.max(
            0,
            boss.hp /
            boss.maxHp *
            100
        )}%`;

}


/* =========================================================
   PET
========================================================= */

function updatePet(delta) {

    if (
        !player.hasPet
    ) {
        return;
    }


    const targetX =
        player.x - 70;

    const targetY =
        player.y - 20;


    const currentX =
        parseFloat(
            petEl.style.left
        ) || targetX;


    const currentY =
        parseFloat(
            petEl.style.top
        ) || targetY;


    const x =
        currentX +
        (
            targetX -
            currentX
        ) * .08 * delta;


    const y =
        currentY +
        (
            targetY -
            currentY
        ) * .08 * delta;


    petEl.style.left =
        `${x}px`;

    petEl.style.top =
        `${y}px`;


    /*
       Pet tự động bắn
    */

    const now =
        performance.now();


    if (
        now -
        petShootTimer <
        700
    ) {
        return;
    }


    petShootTimer = now;


    let target = null;

    let closest = Infinity;


    enemies.forEach(
        enemy => {

            const d =
                distance(
                    enemy,
                    {
                        x,
                        y
                    }
                );

            if (
                d < closest
            ) {

                closest = d;

                target = enemy;

            }

        }
    );


    if (boss) {

        const d =
            distance(
                boss,
                {
                    x,
                    y
                }
            );

        if (
            d < closest
        ) {

            target = boss;

        }

    }


    if (!target) return;


    const angle =
        Math.atan2(
            target.y - y,
            target.x - x
        );


    const el =
        document.createElement(
            "div"
        );


    el.className =
        "bullet";


    el.style.background =
        "#ff00ff";

    el.style.boxShadow =
        "0 0 10px #ff00ff";


    arena.appendChild(el);


    bullets.push({

        x,

        y,

        vx:
            Math.cos(angle) * 7,

        vy:
            Math.sin(angle) * 7,

        damage:
            player.damage,

        el

    });

}


/* =========================================================
   DAMAGE PLAYER
========================================================= */

function damagePlayer(amount) {

    if (!gameRunning) return;


    player.hp -= amount;


    combo = 1;


    createHit(
        player.x,
        player.y,
        "#00ffff"
    );


    updateHUD();


    if (
        player.hp <= 0
    ) {

        player.hp = 0;

        gameOver();

    }

}


/* =========================================================
   DESTROY ENEMY
========================================================= */

function destroyEnemy(enemy) {

    if (!enemy) return;


    if (enemy.el) {
        enemy.el.remove();
    }


    const index =
        enemies.indexOf(enemy);


    if (
        index !== -1
    ) {

        enemies.splice(
            index,
            1
        );

    }


    /*
       Khi stage 1-4
       và toàn bộ quái chết
    */

    if (
        stage < 5 &&
        enemies.length === 0 &&
        !stageCleared
    ) {

        stageCleared = true;

        setTimeout(
            nextStage,
            1000
        );

    }

}


/* =========================================================
   REMOVE BULLET
========================================================= */

function removeBullet(index) {

    if (
        !bullets[index]
    ) {
        return;
    }


    bullets[index].el.remove();

    bullets.splice(
        index,
        1
    );

}


/* =========================================================
   CLEAR ENEMIES
========================================================= */

function clearEnemies() {

    enemies.forEach(
        enemy => {

            if (enemy.el) {
                enemy.el.remove();
            }

        }
    );

    enemies = [];

}


/* =========================================================
   CLEAR EVERYTHING
========================================================= */

function clearAll() {

    clearEnemies();


    bullets.forEach(
        bullet => {

            bullet.el.remove();

        }
    );


    bullets = [];


    drops.forEach(
        drop => {

            drop.el.remove();

        }
    );


    drops = [];


    particles.forEach(
        particle => {

            particle.el.remove();

        }
    );


    particles = [];

}


/* =========================================================
   HIT EFFECT
========================================================= */

function createHit(
    x,
    y,
    color
) {

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const el =
            document.createElement(
                "div"
            );


        el.className =
            "particle";


        el.style.background =
            color;


        el.style.boxShadow =
            `0 0 10px ${color}`;


        arena.appendChild(el);


        particles.push({

            x,

            y,

            vx:
                (
                    Math.random() -
                    .5
                ) * 5,

            vy:
                (
                    Math.random() -
                    .5
                ) * 5,

            life: 25,

            el

        });

    }

}


/* =========================================================
   EXPLOSION
========================================================= */

function createExplosion(
    x,
    y,
    color
) {

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI * 2;


        const speed =
            Math.random() *
            6 + 2;


        const el =
            document.createElement(
                "div"
            );


        el.className =
            "particle";


        el.style.width =
            "7px";

        el.style.height =
            "7px";

        el.style.background =
            color;

        el.style.boxShadow =
            `0 0 12px ${color}`;


        arena.appendChild(el);


        particles.push({

            x,

            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life: 45,

            el

        });

    }

}


/* =========================================================
   PARTICLES
========================================================= */

function updateParticles(delta) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];


        p.x +=
            p.vx * delta;

        p.y +=
            p.vy * delta;


        p.vx *= .97;

        p.vy *= .97;


        p.life -= delta;


        p.el.style.left =
            `${p.x}px`;

        p.el.style.top =
            `${p.y}px`;

        p.el.style.opacity =
            Math.max(
                0,
                p.life / 45
            );


        if (
            p.life <= 0
        ) {

            p.el.remove();

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   DISTANCE
========================================================= */

function distance(
    a,
    b
) {

    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    document.getElementById(
        "score"
    ).textContent =
        Math.floor(score);


    document.getElementById(
        "stage"
    ).textContent =
        `${stage}/5`;


    document.getElementById(
        "combo"
    ).textContent =
        `x${combo.toFixed(1)}`;


    document.getElementById(
        "difficultyText"
    ).textContent =
        DIFFICULTIES[
            difficulty
        ].name;


    document.getElementById(
        "stageTitle"
    ).textContent =
        `${DIFFICULTIES[difficulty].name}
         • STAGE ${stage}/5`;


    document.getElementById(
        "hpText"
    ).textContent =
        `${Math.ceil(player.hp)}
         / ${player.maxHp}`;


    document.getElementById(
        "hpBar"
    ).style.width =
        `${Math.max(
            0,
            player.hp /
            player.maxHp *
            100
        )}%`;

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text) {

    clearTimeout(
        messageTimer
    );


    messageEl.textContent =
        text;


    messageEl.classList.remove(
        "hidden"
    );


    messageTimer =
        setTimeout(
            () => {

                messageEl.classList.add(
                    "hidden"
                );

            },
            1700
        );

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    if (!gameRunning) return;


    gameRunning = false;


    document.getElementById(
        "finalScore"
    ).textContent =
        Math.floor(score);


    gameOverEl.classList.remove(
        "hidden"
    );

}


/* =========================================================
   VICTORY
========================================================= */

function victory() {

    if (!gameRunning) return;


    gameRunning = false;


    createExplosion(
        arena.clientWidth / 2,
        arena.clientHeight / 2,
        "#00ffff"
    );


    document.getElementById(
        "victoryScore"
    ).textContent =
        Math.floor(score);


    setTimeout(
        () => {

            victoryEl.classList.remove(
                "hidden"
            );

        },
        1200
    );

}


/* =========================================================
   MAIN LOOP
========================================================= */

function loop(time) {

    if (!gameRunning) {
        return;
    }


    const delta =
        Math.min(
            2.5,
            (time - lastTime) /
            16.67
        );


    lastTime = time;


    updatePlayer(
        delta
    );


    autoShoot(
        time
    );


    updateBullets(
        delta
    );


    updateEnemies(
        delta
    );


    updateBoss(
        delta
    );


    updateDrops(
        delta
    );


    updateParticles(
        delta
    );


    updatePet(
        delta
    );


    updateHUD();


    requestAnimationFrame(
        loop
    );

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        player.x =
            Math.min(
                player.x,
                arena.clientWidth - 30
            );

        player.y =
            Math.min(
                player.y,
                arena.clientHeight - 40
            );

    }
);