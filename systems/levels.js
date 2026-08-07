import mapGenerator from "./mapGenerator";

const floodItems = [
    { id: "item1", name: "Flashlight", info: "Vital if flood takes down power lines." },
    { id: "item2", name: "Water", info: "A minimum 3-day supply of water is recommended." },
];

const fireItems = [
    { id: "item1", name: "Map", info: "Mark evacuation routes on a physical map." },
    { id: "item2", name: "Compass", info: "Helps avoid getting lost." },
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

function randomizeEvents(tiles, items, tasks) {
    const updated = [...tiles];

    const quizTask = tasks.find(t => t.quiz);
    if (quizTask) {
        updated[5] = {...updated[5], task: quizTask};
    }

    updated[3] = {...updated[3], item: items[0] };

    if (items.length > 1) {
        const randomItemTile = Math.floor(Math.random() * updated.length);
        updated[randomItemTile] = {...updated[randomItemTile], item: items[1]};
    }

    const nonQuizTasks = tasks.filter(t => !t.quiz);
    if (nonQuizTasks.length > 0) {
        const randomTaskTile = Math.floor(Math.random() * updated.length);
        updated[randomTaskTile] = {...updated[randomTaskTile], task: nonQuizTasks[0]};
    }

    return updated;
}

//Creates the level structure for the game
export const levels = [
    {
        //Array structure so the GameBoard can access the information for each level
        //by indexing it
        id: "flood",
        name: "Level 1 - Don't Get Swept Away!",
        requirementsToWin: 2, //Number of tasks that must be completed
        pathTiles: randomizeEvents(mapGenerator(5, 5, 70, 30), floodItems, floodTasks)
    },
    {
        id: "wildfire",
        name: "Level 2 - Stay Outta the Heat!",
        requirementsToWin: 3,
        pathTiles: randomizeEvents(mapGenerator(5, 5, 70, 20), fireItems, fireTasks)
    }
];