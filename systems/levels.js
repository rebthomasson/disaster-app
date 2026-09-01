import mapGenerator from "./mapGenerator";

const floodItems = [
    { id: "item1", name: "Flashlight", icon: "🔦", info: "Vital if flood takes down power lines." },
    { id: "item2", name: "Water", icon: "💧", info: "A minimum 3-day supply of water is recommended." },
];

const fireItems = [
    { id: "item1", name: "Map", icon: "🗺️", info: "Mark evacuation routes on a physical map." },
    { id: "item2", name: "Compass", icon: "🧭", info: "Helps avoid getting lost." },
];

const floodTasks = [
    {
        id: "task1",
        text: "Take the flood prep quiz now!",
        quiz: [
            {
            question: "What should you do if you receive an evacuation order?",
            options: ["Stay put", "Leave immediately", "Check social media", "Go to sleep"],
            answer: 1
            },
            {
            question: "How much water should you keep?",
            options: ["One bottle", "3 gallons per day", "16 oz per day", "1 gallon per day, 3 days minimum"],
            answer: 3
            }
        ]
    },
    { id: "task2", text: "Use the map feature to learn your evacuation routes." },

];

const fireTasks = [
    { id: "task1", text: "Clear flammable materials at least 30 feet from your home." },
    { id: "task2", text: "Practice evacuation routes near you." },
    {
        id: "task3",
        text: "Take the fire prep quiz now",
        quiz: [
            {
            question: "During a wildfire, what is one sign you may need to evacuate?",
            options: ["Heavy smoke", "Clear skies", "Rainfall", "Cool temperatures"],
            answer: 0
            },
            {
            question: "Why keep copies of important documents?",
            options: ["For trade", "Decoration", "Identity and recovery", "Entertainment"],
            answer: 2
            }
        ]
    }
]

function getRandomValidTileIndex(updatedTiles) {
    const lastTile = updatedTiles.length - 1;

    let index;
    do {
        index = Math.floor(Math.random() * updatedTiles.length);
    } while (index === 0 || index === lastTile);

    return index;
}

function randomizeEvents(tiles, rules, items, tasks) {
    const updatedTiles = [...tiles];
    const lastTile = updatedTiles.length - 1;

    if (rules.terrainTypes) {
        for (const [terrain, indices] of Object.entries(rules.terrainTypes)) {
            indices.forEach(i => {
                if (i != 0 && i != lastTile) {
                    updatedTiles[i].terrain = terrain;

                    if (rules.terrainEvents && rules.terrainEvents[terrain]) {
                        const eventRule = rules.terrainEvents[terrain];
                        updatedTiles[i].eventChance = eventRule.eventChance;
                        updatedTiles[i].eventType = eventRule.eventType;
                        updatedTiles[i].message = eventRule.message;
                        updatedTiles[i].movementPenalty = eventRule.movementPenalty;
                    }
                }
            })
        }
    }

    updatedTiles[lastTile].terrain = "finish";
    updatedTiles[lastTile].icon = "🏁";

    const quizTask = tasks.find(t => t.quiz);
    if (quizTask) {
        updatedTiles[5] = {...updatedTiles[5], task: quizTask};
    }

    updatedTiles[3] = {...updatedTiles[3], item: items[0] };

    if (items.length > 1 ) {
        const randomItemTile = getRandomValidTileIndex(updatedTiles);
        updatedTiles[randomItemTile] = {...updatedTiles[randomItemTile], item: items[1]};
    }

    const nonQuizTasks = tasks.filter(t => !t.quiz);
    if (nonQuizTasks.length > 0) {
        const randomTaskTile = getRandomValidTileIndex(updatedTiles);
        updatedTiles[randomTaskTile] = {...updatedTiles[randomTaskTile], task: nonQuizTasks[0]};
    }

    return updatedTiles;
}

//Creates the level structure for the game
export const levels = [
    {
        //Array structure so the GameBoard can access the information for each level
        //by indexing it
        id: "flood",
        name: "Level 1 - Don't Get Swept Away!",
        background: require('../assets/flood-background.jpg'),
        tintColor: 'rgba(0, 50, 100, 0.4)',
        overlay: require('../assets/rain.png'),
        requirementsToWin: 2, //Number of tasks that must be completed
        timeLimit: 60, // 60 seconds for the level
        goal: "Complete 2 flood-prep tasks to escape the disaster!",
        pathTiles: randomizeEvents(mapGenerator(5, 5, 70, 30), 
        {
            terrainTypes: {
                water: [3, 4, 5],
                mud: [7, 8],
                debris: [10, 11]
            },   
            terrainEvents: {
                water: {
                    eventChance: 0.4,
                    eventType: 'slip',
                    message: "You slipped in the flood water! You have to retrace your steps.",
                    movementPenalty: 2,
                },
                mud: {
                    eventChance: 0.5,
                    eventType: 'slowdown',
                    message: "You got stuck in the mud, and it slowed you down!",
                    movementPenalty: 1
                },
                debris: {
                    eventChance: 0.5,
                    eventType: 'blockage',
                    message: "Debris blocked your path, you have to clear it before moving forward.",
                    movementPenalty: 0,
                }
            }
        },
        floodItems, 
        floodTasks),
        scoring: {
            taskCompleted: 100,
            itemCollected: 50,
            eventTriggered: -50,
            finishReached: 200
        },
        xpReward: 100,
    },
    {
        id: "wildfire",
        name: "Level 2 - Stay Outta the Heat!",
        background: require('../assets/wildfire-background.jpg'),
        tintColor: 'rgba(150, 50, 0, 0.4)',
        overlay: require('../assets/embers.png'),
        requirementsToWin: 3,
        timeLimit: 120, // 120 seconds for the level,
        goal: "Complete 3 fire-prep tasks to survive the heat!",
        pathTiles: randomizeEvents(mapGenerator(6, 8, 70, 20, ['fire', 'smoke', 'debris']),
        {
            terrainTypes: {
                fire: [5, 9, 13, 17],
                smoke: [7, 8, 10, 20, 21, 22],
                debris: [2, 6, 15, 18]
            },
            terrainEvents: {
                fire: {
                    eventChance: 0.6,
                    eventType: 'burn',
                    message: "You were hurt by the fire! You have to find a way to put it out.",
                    movementPenalty: 2,
                },
                smoke: {
                    eventChance: 0.7,
                    eventType: 'slowdown',
                    message: "You got caught in the smoke, and had to wait for it to clear!",
                    movementPenalty: 3
                },
                debris: {
                    eventChance: 0.6,
                    eventType: 'blockage',
                    message: "Debris blocked your path, you have to clear it before moving forward.",
                    movementPenalty: 1,
                }
            }
        },
        fireItems, fireTasks),
        scoring: {
            taskCompleted: 100,
            itemCollected: 50,
            eventTriggered: -50,
            finishReached: 200
        },
        xpReward: 200,
    }
];