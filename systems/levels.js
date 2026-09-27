import mapGenerator from "./mapGenerator";

const floodItems = [
    { id: "item1", name: "Flashlight", icon: "🔦", info: "Vital if flood takes down power lines." },
    { id: "item2", name: "Water", icon: "💧", info: "A minimum 3-day supply of water is recommended." },
];

const fireItems = [
    { id: "item1", name: "Map", icon: "🗺️", info: "Mark evacuation routes on a physical map." },
    { id: "item2", name: "Compass", icon: "🧭", info: "Helps avoid getting lost." },
];

const earthquakeItems = [
    { id: "item1", name: "Food", icon: "🫘", info: "Pack enough non-perishable food for several days per person." },
    { id: "item2", name: "First Aid Kit", icon: "💊", info: "First aid kits are essential for treating injuries post-earthquake." },
    { id: "item3", name: "Radio", icon: "📻", info: "An NOAA hand-crank weather radio can help you stay informed during emergencies." },
]

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
            },
            {
                question: "What is the safest action to take if you encounter a flooded roadway while driving?",
                options: ["Drive through slowly if you estimate the water is less than a foot deep", "Shift your car into a lower gear and accelerate quickly", "Wait for another large vehicle to cross first, and then follow closely behind it", "Turn around and find an alternate route"],
                answer: 3
            }
        ]
    },
    { id: "task2", text: "Use the map feature to learn about disaster relief shelters." },

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
            },
            {
                question: "Upon coming across a significant fire you should",
                options: ["Call for assistance and wait for emergency services to show up", "Take your leave right away", "Call 911 and leave right afterwards", "Try and stifle it"],
                answer: 2
            },
            {
                question: "When is it important to replace items that can go bad in your emergency kit (medication, food, batteries, water, etc.)?",
                options: ["Every 3 weeks","Once a year", "Every 7 months",, "Every other year"],
                answer: 1
            }
        ]
    }
]

const earthquakeTasks = [
    { id: "task1", text: "Use the emergency kit builder in the Prepare tab to gather supplies" },
    { id: "task2", text: "Establish a communication plan using the Family Communication Plan form in the Prepare tab." },
    {id: "task3", text: "Secure your home and space by anchoring heavy furniture."},
    {
        id: "task4",
        text: "Take an earthquake prep quiz now",
        quiz: [
            {
                question: "During an earthquake, what is the safest immediate action to take?",
                options: ["Stand near windows", "Drop, cover, and hold on", "Hide in a basement corner", "Run outside immediately"],
                answer: 1
            },
            {
                question: "If rocks begin falling during an earthquake, what should you avoid?",
                options: ["Sheltering under a study table", "Moving away from windows", "Covering your head and neck", "Standing near cliffs or steep slopes"],
                answer: 3
            },
            {
                question: "What is a common sign that an earthquake may cause landslides or falling rocks?",
                options: ["Birds flying away", "Cracks forming in the ground or hillside", "Cloudy weather", "Light rain earlier in the day"],
                answer: 1
            }
        ]
    },
    {
        id: "task5",
        text: "Take an earthquake prep quiz now",
        quiz: [
            {
                question: "Which item is most important to have ready during an earthquake emergency?",
                options: ["A board game", "Extra pillows", "A first aid kit", "A decorative lantern"],
                answer: 2
            },
            {
                question: "True or false, more people suffer injuries and death from furniture falling down than from building accidents?",
                options: ["True", "False"],
                answer: 0
            },
            {
                question: "What is the space of time in which aftershocks continue to occur?",
                options: ["12-14 days", "A year or longer", "Several hours", "Several weeks"],
                answer: 3
            }
        ]
    }
];

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

    //Terrain rules
    if (rules.terrainTypes) {
        for (const [terrain, indices] of Object.entries(rules.terrainTypes)) {
            indices.forEach(i => {
                if (i !== 0 && i !== lastTile) {
                    updatedTiles[i].terrain = terrain;

                    if (rules.terrainEvents && rules.terrainEvents[terrain]) {
                        const eventRule = rules.terrainEvents[terrain];
                        updatedTiles[i].eventChance = eventRule.eventChance;
                        updatedTiles[i].eventType = eventRule.eventType;
                        updatedTiles[i].message = eventRule.message;
                        updatedTiles[i].movementPenalty = eventRule.movementPenalty;
                    }
                }
            });
        }
    }

    //Define finish tile
    updatedTiles[lastTile].terrain = "finish";
    updatedTiles[lastTile].icon = "🏁";

    // Place quiz tasks on the game board
    const quizTasks = tasks.filter(t => t.quiz) || [];
    const totalTiles = updatedTiles.length;

    quizTasks.forEach((qt, index) => {
        const tileIndex = Math.floor((totalTiles * (index + 1)) / (quizTasks.length + 1));
        const safeTile = Math.max(1, Math.min(tileIndex, lastTile - 1));

        updatedTiles[safeTile] = { ...updatedTiles[safeTile], task: qt };
    });

    const quizTileIndices = quizTasks.map((qt, index) => {
        const tileIndex = Math.floor((totalTiles * (index + 1)) / (quizTasks.length + 1));
        return Math.max(1, Math.min(tileIndex, lastTile - 1));
    });

    // Place items on the game board
    items.forEach((item, index) => {
        let tile;

        if (index === 0) {
            tile = 3; // first item always on tile 3
        } else {
            do {
                tile = getRandomValidTileIndex(updatedTiles);
            } while (
                tile === 3 || // avoid first item tile
                quizTileIndices.includes(tile)
            );
        }

        updatedTiles[tile] = { ...updatedTiles[tile], item };
    });

    // Place any non-quiz tasks on the game board
    const nonQuizTasks = tasks.filter(t => !t.quiz);

    nonQuizTasks.forEach(task => {
        let tile;

        do {
            tile = getRandomValidTileIndex(updatedTiles);
        } while (
            quizTileIndices.includes(tile) //avoid quiz tiles
        );

        updatedTiles[tile] = { ...updatedTiles[tile], task };
    });

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
        reading: "If you want to prepare before beginning the level, here's a short reading on flood safety: ",
        article_url: "https://www.ready.gov/floods",
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
                    movementPenalty: 1,
                },
                mud: {
                    eventChance: 0.5,
                    eventType: 'slowdown',
                    message: "You got stuck in the mud, and it slowed you down!",
                    movementPenalty: 1
                },
                debris: {
                    eventChance: 0.4,
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
        timeLimit: 90, // 90 seconds for the level,
        goal: "Complete 3 fire-prep tasks to survive the heat!",
        reading: "If you want to prepare before beginning the level, here's a short reading on wildfire safety: ",
        article_url: "https://www.ready.gov/wildfires",
        pathTiles: randomizeEvents(mapGenerator(6, 8, 70, 20),
        {
            terrainTypes: {
                fire: [5, 13, 17],
                smoke: [7, 20, 21, 42],
                debris: [2, 28, 30]
            },
            terrainEvents: {
                fire: {
                    eventChance: 0.5,
                    eventType: 'burn',
                    message: "You were hurt by the fire! You have to find a way to put it out.",
                    movementPenalty: 2,
                },
                smoke: {
                    eventChance: 0.6,
                    eventType: 'slowdown',
                    message: "You got caught in the smoke, and had to wait for it to clear!",
                    movementPenalty: 2
                },
                debris: {
                    eventChance: 0.5,
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
    },
    {
        id: "earthquake",
        name: "Level 3 - Take Cover!",
        background: require('../assets/earthquake.jpg'),
        tintColor: 'rgba(48, 97, 70, 0.4)',
        overlay: require('../assets/rocks.png'),
        requirementsToWin: 5,
        timeLimit: 120, // 120 seconds for the level,
        goal: "Complete 5 earthquake-prep tasks to make it safely through the disaster!",
        reading: "If you want to prepare before beginning the level, here's a short reading on earthquake safety: ",
        article_url: "https://www.ready.gov/earthquakes",
        pathTiles: randomizeEvents(mapGenerator(8, 8, 70, 20),
        {
            terrainTypes: {
                rock: [3, 12, 19, 27],
                rubble: [33, 35, 38, 39, 43],
                debris: [48, 50, 54, 57, 58, 62]
            },
            terrainEvents: {
                rock: {
                    eventChance: 0.6,
                    eventType: 'burn',
                    message: "You were trapped by fallen rocks! You have to escape before continuing.",
                    movementPenalty: 2,
                },
                rubble: {
                    eventChance: 0.7,
                    eventType: 'slowdown',
                    message: "You had to navigate around the rubble!",
                    movementPenalty: 3
                },
                debris: {
                    eventChance: 0.6,
                    eventType: 'blockage',
                    message: "Debris blocked your path, you have to clear it before moving forward.",
                    movementPenalty: 3,
                }
            }
        },
        earthquakeItems, earthquakeTasks),
        scoring: {
            taskCompleted: 100,
            itemCollected: 50,
            eventTriggered: -100,
            finishReached: 300
        },
        xpReward: 300,
    }
];