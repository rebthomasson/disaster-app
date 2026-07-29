//Creates the level structure for the game
export const levels = [
    {
        //Array structure so the GameBoard can access the information for each level
        //by indexing it
        id: "flood",
        name: "Level 1 - Don't Get Swept Away!",
        requirementsToWin: 2, //Number of tasks that must be completed
        tasks: [
            {
                //Array structure for the tasks and quizzes if applicable
                id: 'task1',
                row: 0,
                column: 4,
                text: "Take the flood prep quiz now!",
                quiz: [
                    {
                        question: "What should you do if you receive an evacuation order?",
                        options: ["Stay put", "Leave immediately and follow designated evacuation routes", "Check social media for updates", "Go to sleep and hope for the best"],
                        answer: 1
                    },
                    {
                        question: "What is the recommended amount of water supply to keep on hand for an emergency?",
                        options: ["One bottle should be good", "3 gallons per person per day, 6-8 week supply", "16 oz per person per day, 3 day supply minimum.", "1 gallon per person per day, 3 day supply minimum."],
                        answer: 3
                    }
                ]
            },
            {id: 'task2', row: 3, column: 3, text: "Use the map feature to learn your evacuation routes."}
        ],
        items: [
            {id: 'item1', row: 1, column: 0, name: 'Water', info: 'A minimum 3-day supply of water (1 gallon per person per day) is recommended.'},
            {id: 'item2', row: 4, column: 3, name: 'Flashlight', info: 'Flashlights are vital if a flood takes down power lines.'}
            
        ]
    },
    {
        //Level 2
        id: "wildfire",
        name: "Level 2 - Stay Outta the Heat!",
        requirementsToWin: 3,
        tasks: [
            {id: 'task1', row: 2, column: 1, text: "Practive evacuation routes near you"},
            {
                id: 'task2',
                row: 3, column: 4,
                text: "Take the fire prep quiz now",
                quiz: [
                        {
                            question: "During a wildfire, what is one sign you may need to evacuate?",
                            options: ["Heavy smoke", "Clear skies", "Rainfall", "Cool temperatures"],
                            answer: 0
                        },
                                                {
                            question: "Why should you keep copies of important documents in your emergency kit?",
                            options: ["For trade", "For decoration", "For identity and recovery", "For entertainment"],
                            answer: 2
                        },
                ]
            },
            {id: 'task3', row: 4, column: 2, text: "Clear flammable materials at least 30 feet from your home"}
        ],
        items: [
            {id: 'item1', row: 0, column: 1, name: 'Compass', info: 'A compass can help you avoid getting lost on your evacuation route'},
            {id: 'item2', row: 2, column: 3, name: 'Map', info: 'You can mark evacuation routes on a physical map.'}
        ]
    }
]