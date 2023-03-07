
const DBName = "AmazonSellerRatingPluginData";
const DBVersion = 4;
const ObjectStoreName = "SellerRating";

function initDatabase(callbackOnSuccess) {
    const request = indexedDB.open(DBName, DBVersion);
    
    console.log("Opening database" + request);
    request.onerror = (event) => {
        console.log("Error opening database>>" + event.target.error);
        //event.target.result.close();
    }

    request.onupgradeneeded = (event) => {
        
        console.log("Upgrading database");
        const db = event.target.result;

        if(db.objectStoreNames.contains(ObjectStoreName)) {
            db.deleteObjectStore(ObjectStoreName);
        }

        const objectStore = db.createObjectStore(ObjectStoreName, { keyPath: "sellerID" });


        objectStore.transaction.oncomplete = (event) => {
            console.log("Database setup complete");
            /*sellerData = {
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
        const db = event.target.result;
        console.log("Database opened successfully");
        callbackOnSuccess(db);
        
    }

}


function cacheData(db, data, callbackOnSuccess) {
    const transaction = db.transaction(ObjectStoreName, "readwrite");

    transaction.oncomplete = (event) => {
        console.log("All done!");
    };
    
    transaction.onerror = (event) => {
    // Don't forget to handle errors!
        console.log("transaction error>>" + event.target.error)
       
    };

    const objectStore = transaction.objectStore(ObjectStoreName);

    const request = objectStore.add(data);

    request.onsuccess = (event) => {            
        callbackOnSuccess(event);
        
    }    

}

function getData(db, sellerID, callbackOnSuccess) {
    
    const transaction = db.transaction(ObjectStoreName);
        
    const objectStore = transaction.objectStore(ObjectStoreName);

    const request = objectStore.get(sellerID);

    request.onerror = (event) => {
        console.log("Error reading data" + event.target.error);
    }

    request.onsuccess = (event) => {
        callbackOnSuccess(event, event.target.result);
        
    };
}

function updateData(db, sellerID, callbackOnUpate){
    const objectStore = db
        .transaction(ObjectStoreName, "readwrite")
        .objectStore(ObjectStoreName);

    const request = objectStore.get(sellerID);

    request.onerror = (event) => {
        // Handle errors!
    };

    request.onsuccess = (event) => {
        // Get the old value that we want to update
        const data = event.target.result;
    
        // update the value(s) in the object that you want to change
        
        callbackOnUpate(data);

        /*data.sellerName = updatedData.sellerName;
        data.rating = updatedData.rating;
        data.ratingCount = updatedData.ratingCount;
        data.ratingCount1Stars = updatedData.ratingCount1Stars;
        data.ratingCount2Stars = updatedData.ratingCount2Stars;
        data.ratingCount3Stars = updatedData.ratingCount3Stars;
        data.ratingCount4Stars = updatedData.ratingCount4Stars;
        data.ratingCount5stars = updatedData.ratingCount5stars;
        data.lastUpdated = updatedData.lastUpdated;*/
    
        // Put this updated object back into the database.
        const requestUpdate = objectStore.put(data);
        requestUpdate.onerror = (event) => {
        // Do something with the error
        };
        requestUpdate.onsuccess = (event) => {
        // Success - the data is updated!
            console.log("database successfully updated");
        };
    };

}