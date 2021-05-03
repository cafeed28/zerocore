enum EActions {
    accountLogin,       // ip | timestamp | accID
    levelDelete,        // ip | timestamp | accID | levelID
    levelDownload,      // ip | timestamp | accID | levelID
    itemLike,           // ip | timestamp | accID | itemID | itemType
    userScoreUpdate     // ip | timestamp | accID
}

export default EActions;