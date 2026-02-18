export const DefaultEcoleDirecteAccount = {
    username: import.meta.env.VITE_DEFAULT_USERNAME,
    password: import.meta.env.VITE_DEFAULT_PASSWORD,
    token: "",
    selectedUserIndex: 0,
    users: null,
} as const

const defaultMessageFolders = [
    {
        id: 0,
        name: "Boîte de réception",
        fetchInitiated: false,
        fetched: false
    },
    {
        id: -1,
        name: "Envoyés",
        fetchInitiated: false,
        fetched: false
    },
    {
        id: -2,
        name: "Archivés",
        fetchInitiated: false,
        fetched: false
    },
    {
        id: -3,
        name: "Nouveau dossier",
        fetchInitiated: true,
        fetched: true
    },
    {
        id: -4,
        name: "Brouillons",
        fetchInitiated: false,
        fetched: false
    },
];

export const DefaultAccountdata = {
    grades: undefined,                           // OK
    homeworks: undefined,                        // OK
    upcomingAssignments: undefined,              // OK
    schoolLife: undefined,                       // WAITING
    messageFolders: defaultMessageFolders,       // IN_PROGRESS
    messages: undefined,                         // IN_PROGRESS
    administrativeDocuments: undefined,          // WAITING
    totalBadges: undefined,                      // OK
    generalAverageHistory: undefined,            // OK
    classGeneralAverageHistory: undefined,       // OK
    streakScoreHistory: undefined,               // OK
    subjectsComparativeInformation: undefined,   // OK
    gradesEnabledFeatures: undefined,            // OK
    lastGrades: undefined,                       // OK

    activePeriod: undefined,                     // OK
    selectedGradeElement: undefined,             // OK
    activeHomeworkDate: undefined,               // OK
    activeHomeworkId: undefined,                 // OK
    selectedMessageId: null,                     // OK
} as const;

