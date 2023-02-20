document.body.style.border = "5px solid red" 

let idMerchant = "merchant-info"
let sellerInfo = document.getElementById(idMerchant)
 

if(sellerInfo != null) {    


    let links = sellerInfo.getElementsByClassName("a-link-normal")

    let merchantLinkRelative = null

    if(links != null && links.length > 0) {
        for(element of links) {
            let href = element.attributes["href"]
            if(href!=null) {
                value = href.value
                if(value.includes("marketplaceID=")) {
                    merchantLinkRelative = value
                }
            }    
        }
    }
    else {
        let element = document.getElementById("sellerProfileTriggerId");
        let href = element.attributes['href']

        if(href!=null) {
            value = href.value
            if(value.includes("marketplaceID=")) {
                merchantLinkRelative = value
            }
        }

    }
    

    if(merchantLinkRelative!=null) {
        let locationSplit = location.href.split("//")
        let hostName0 = locationSplit[0]
        let hostName1 = locationSplit[1].split("/")[0]

        let hostName = hostName0 + "//"+ hostName1;
        const merchantLinkFull = hostName + merchantLinkRelative

        console.log("full link>>" + merchantLinkFull)

        let xhr = new XMLHttpRequest();

        xhr.onload = function () {
            console.log(this.responseXML)
            let divMerchantRating = this.responseXML.getElementById("seller-feedback-summary-rd");
            let ratingFull = null;
            let ratingStars = null;
            let ratingPercentageText = null;
            let ratingPercentage = 0;
            let countRatings = 0;
            
            if(divMerchantRating != null) {
                ratingFull = divMerchantRating.getElementsByClassName("feedback-detail-description");

                if(ratingFull!=null && ratingFull.length > 0) {
                    ratingStars = ratingFull[0].getElementsByClassName("feedback-detail-stars");
                    ratingPercentageText = ratingFull[0].text.replace(ratingStars[0].innerText, "");
                    ratingPercentage = parseInt(ratingPercentageText.split("% positive")[0]);
                    countRatings = parseInt(ratingPercentageText.split("(")[1].split(" ")[0]);
                }
            }
            
            let sellerName = this.responseXML.getElementById("sellerName-rd").innerText;            

            let divPrevious = document.getElementById("zeitgeistBadge_feature_div"); //best selling rank
            if(divPrevious == null) {
                divPrevious = document.getElementById("ask_feature_div"); //Asked questions div
            }
            if(divPrevious == null) {
                divPrevious = document.getElementById("averageCustomerReviews")
            }
            if(divPrevious == null) {
                divPrevious = document.getElementById("averageCustomerReviews_feature_div");
            }

            let starCount = Math.round(ratingPercentage/100.0 * 5);

            let starOutlineUrl = chrome.runtime.getURL('32_greyOutline.png');
            let starUrl = chrome.runtime.getURL("32_grey.png")

            let starOutlineHtml = `<img width="16" height="16" src='${starOutlineUrl}' />`
            let starHtml = `<img width="16" height="16" src='${starUrl}' />`            

            let starHtmlFull = '';
            for(let i=0;i <starCount; i++) {
                starHtmlFull += starHtml
            }

            for(let i=0; i<(5-starCount);i++) {
                starHtmlFull += starOutlineHtml
            }
            
           
            let shadowRoot = document.createElement("div");
            divPrevious.after(shadowRoot);
            let shadowDom = shadowRoot.attachShadow({mode: "closed"});

            if(divMerchantRating!=null && sellerName!=null) {

                fetch(chrome.runtime.getURL('html/templateMerchantRating.html'))
                .then(r => r.text())
                .then(html => {
                                      
                    let htmlUpdated = html.replace("_placeHolderStars_", starHtmlFull)
                    .replace("_placeHolderRatingCount_", countRatings)
                    .replace("_placeHolderSellerLink_", merchantLinkFull)
                    .replace("_placeHolderSellerName_", sellerName);                    
                    
                    createRatingPopupHTML(this.responseXML, starHtmlFull, ratingPercentage /*todo: replace with rating percentage*/, countRatings)                    
                    .then(html2 => { 
                      
                        shadowDom.innerHTML = htmlUpdated + html2;

                        let ee = document.getElementById("merchant-info");
                        console.log(ee);
                    });                    
                    
                });
               
            }
            else {

                fetch(chrome.runtime.getURL('html/templateMerchantRatingFail.html'))
                .then(r => r.text())
                .then(html => {
                    shadowDom.innerHTML = html;                    
                });
               
            }

            //divPrevious.after(iframeMerchantDetails);
            
        }
        testFunction();
        xhr.onerror = function(e) {
            console.log("Couldn't fetch merchant page. Status: " + e.target.status);
        }

        xhr.open("GET", merchantLinkFull, true);
        xhr.responseType = "document";
        xhr.send();
    }
}