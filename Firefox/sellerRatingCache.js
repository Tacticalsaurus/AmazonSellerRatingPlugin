
const DBName = "AmazonSellerRatingPluginData";

const request = indexedDB.open(DBName, 1);
console.log("Opening database" + request);
request.onerror = (event) => {
    console.log("Error opening database");
}

request.onupgradeneeded = (event) => {
    
    const db = event.target.result;
    const objectStore = db.createObjectStore("SellerRating", { keyPath: "sellerID" });

    objectStore.transaction.oncomplete = (event) => {
        sellerData = {
            sellerID: "A1V6B6X13IP5F8",
            sellerName: "Name",
            rating: 4.5,
            ratingCount: 1000,

            ratingCount1Stars: 30,
            ratingCount2Stars: 30,
            ratingCount3Stars: 30,
            ratingCount4Stars: 30,
            ratingCount5stars: 30,

            lastUpdated: new Date()
        };
        /*
        const sellerDatas = [
            { sellerID: "A1V6B6X13IP5F8", rating: 4.5, ratingCount: 1000 },
            { sellerID: "A1TQZUSOU22E9M", rating: 4.1, ratingCount: 2000 },
            { sellerID: "A1JWSDDIH5Z7DV", rating: 4.3, ratingCount: 3000 },
        ]
        const sellerRatingObjectStore = db.transaction("SellerRating", "readwrite").objectStore("SellerRating");

        sellerDatas.forEach((sellerData) => {
            sellerRatingObjectStore.add(sellerData);
        });
        */
    }    

}

request.onsuccess = (event) => {
    console.log("Database opened successfully");
}

function saveData(data) {
    const transaction = db.transaction("SellerRating", "readwrite");

    transaction.oncomplete = (event) => {
        console.log("All done!");
    };
    
    transaction.onerror = (event) => {
    // Don't forget to handle errors!
    };

    const objectStore = transaction.objectStore("customers");

    const request = objectStore.add(data);

    request.onsuccess = (event) => {
        // event.target.result === customer.ssn;
    };

}