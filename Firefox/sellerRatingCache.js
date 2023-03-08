
const DBName = "AmazonSellerRatingPluginData";
const DBVersion = 4;
const ObjectStoreName = "SellerRating";
let db = null;



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
        
    }    

}

request.onsuccess = (event) => {
    db = event.target.result;
    
    listRequests.forEach(element => {
        if(element.type === "cacheData") {
            cacheData(element.data, element.callbackOnSuccess);
        }
        else if(element.type === "getData") {
            getData(element.sellerID, element.callbackOnSuccess);
        }
        else if(element.type === "updateData") {
            updateData(element.sellerID, element.callbackOnUpdate);
        }
        else {
            console.error("Invalid request type>>" + element.type);
        }
    });
    
}



listRequests = []; //If db is null when cacheData(), getData() etc.. are called, these calls cached in here so that they can be executed when db in inited

function cacheData(data, callbackOnSuccess) {
    if(db===null) {
        listRequests.push(
            {
                type: "cacheData",                
                data: data,
                callbackOnSuccess: callbackOnSuccess
            });
        return;
    }
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

function getData(sellerID, callbackOnSuccess) {
    if(db===null) {
        listRequests.push({
            type: "getData",
            sellerID: sellerID,
            callbackOnSuccess: callbackOnSuccess
        });
        return;
    }
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

function updateData(sellerID, callbackOnUpdate){
    if(db===null) {
        listRequests.push({
            type: "updateData",
            sellerID: sellerID,
            callbackOnUpdate: callbackOnUpdate
        });
        return;
    }

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
        
        callbackOnUpdate(data);  
        console.log("updated data>>" + data.ratingCount);
    
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