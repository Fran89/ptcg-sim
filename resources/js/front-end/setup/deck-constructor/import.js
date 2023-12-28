import { reset } from "../../actions/general/reset.js";
import { altDeckImportInput, failedText, importButton, invalid, mainDeckImportInput, p1, p1Button, p2Button, roomId, socket } from "../../front-end.js";
import { appendMessage } from "../chatbox/messages.js";
import { determineUsername } from "../general/determine-username.js";
import { show } from "../home-header/header-toggle.js";
import { getCardType } from "./find-type.js";

export const mainDeckData = [];
export const altDeckData = [];

const assembleCard = (quantity, name, set, imageURL, type) => {
    const imageAttributes = {
        src: imageURL,
        alt: name,
        draggable: true,
        click: 'imageClick',
        dblclick: 'doubleClick',
        dragstart: 'dragStart',
        dragover: 'dragOver',
        dragleave: 'dragLeave',
        dragend: 'dragEnd',
        id: 'card',
        contextmenu: 'openCardContextMenu'
    };
    const cardAttributes = {
        name: name,
        type: type,
        set: set
    };

    const rawCardAttributes = JSON.stringify(cardAttributes);
    const rawImageAttributes = JSON.stringify(imageAttributes);

    return [quantity, rawCardAttributes, rawImageAttributes];
}

export const importDecklist = (user) => {
    failedText.style.display = 'none';
    invalid.style.display = 'none';
    importButton.disabled = true;

    const decklist = user === 'self' ? mainDeckImportInput.value : altDeckImportInput.value;

    if (!decklist) {
        console.log("killed");
        failedText.style.display = 'block';      
        importButton.disabled = false;
        return;
    };

    //helper function (will determine if card is not supported by limitless in which cause will use ptcg.io API)
    function hasDashAndNumber(string) {
        // Check if the string contains a dash and a number
        const hasDash = string.includes('-');
        const hasNumber = /\d/.test(string);

        // Return true if both conditions are met
        return hasDash && hasNumber;
    } 
    
    // Initialize an array to store the results
    const decklistArray = [];
    
    // Split the decklist into lines
    const lines = decklist.split('\n');
    
    let num_old_cards = 0;

    // Process each line
    lines.forEach(line => {

        line = line.trim(); // Remove leading and trailing white spaces

        let splitline = line.split(' ');

        const potential_card_id = splitline[2]; //potentially put in try catch to avoid index out of bounds (line doesn't have 3 words)

        const is_old_card = potential_card_id ? hasDashAndNumber(potential_card_id) : false;
        
        if (is_old_card) {
            num_old_cards++;
        }
    });


    let card_id;
    let old_card_count = 0;

    // Process each line
    lines.forEach(line => {

        line = line.trim(); // Remove leading and trailing white spaces

        let splitline = line.split(' ');

        const potential_card_id = splitline[2]; //potentially put in try catch to avoid index out of bounds (line doesn't have 3 words)

        const is_old_card = potential_card_id ? hasDashAndNumber(potential_card_id) : false;
        
        if (is_old_card) { //if its a new card use new card procedure 
            old_card_count++;
            // assign values to card attributes  
            const quantity = splitline[0];
            const name = splitline[1];
            card_id = potential_card_id;
            console.log(card_id);
            fetch('https://api.pokemontcg.io/v2/cards/' + card_id, {
                method: 'GET',
                headers: {
                    'X-Api-Key': 'cde33a60-5d8a-414e-ae04-b447090dd6ba'
                }
            })
            .then(response => response.json())
            .then(({data}) => {
                // Destructure data from the response object
                const set = data.set.name; 
                const imageURL = data.images.large; 
                const card_type = data.supertype;
                decklistArray.push([parseInt(quantity), name, set, imageURL, card_type]);
                
                let deckData;
                deckData = decklistArray.map(card => assembleCard(...card));


                if (user === 'self') {
                    mainDeckData[0] = deckData;
                } else {
                    altDeckData[0] = deckData;
                };
                if (failedText.style.display === 'none') {
                    if (p1[0]){
                        show('p1Box', p1Button);
                    } else if (user === 'self'){
                        show('p2Box', p2Button);
                    };
                };
                importButton.disabled = false;
            
                
                console.log(old_card_count);
                if (user === 'self') {
                    const oUser = user === 'self' ? 'opp' : 'self';
                    const data = {
                        roomId : roomId[0],
                        deckData : mainDeckData[0],
                        user: oUser
                    };
                    socket.emit('deckData', data);
                };
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });

    reset(user, true, true, true, false);
    //reset(user, true, true, true, false);
    // if (!(user === 'opp' && !p1[0])) {
    //     appendMessage(user, determineUsername(user) + ' imported deck', 'announcement', true);
    // } else {
    //     invalid.style.display = 'block';
    // };
    appendMessage(user, determineUsername(user) + ' imported deck', 'announcement', true);

}
            
    // const url = "http://127.0.0.1:8000/deck";
    // fetch(url, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(decklist)
    //   })
    //     .then(response => response.json())
    //     .then(data => {
    //         loadingText.style.display = 'none';
    //         if (decklistArray.length === data.image_urls.length) {
    //             for (let i = 0; i < decklistArray.length; i++) {
    //                 decklistArray[i].push(data.image_urls[i]);
    //             };
    //             let deckData;
    //             deckData = decklistArray.map(card => assembleCard(...card));
    //             if (user === 'self'){
    //                 mainDeckData[0] = deckData;
    //             } else {
    //                 altDeckData[0] = deckData;
    //             };
    //             successText.style.display = 'block';
    //             appendMessage(user, determineUsername(user) + ' imported deck', 'announcement');
    //         } else {
    //             failedText.style.display = 'block';    
    //         };
    //         importButton.disabled = false;
    //     })
    //     .catch(error => {
    //         console.error('Error during fetch:', error);
    //         loadingText.style.display = 'none';
    //         failedText.style.display = 'block';
    //         importButton.disabled = false;
    //     });

// const decklist = [
//     [4, 'comfey', '/resources/card-scans/comfey.webp', 'pokemon'],
//     [2, 'sableye', '/resources/card-scans/sableye.webp', 'pokemon'],
//     [1, 'cramorant', '/resources/card-scans/cramorant.webp', 'pokemon'],
//     [1, 'kyogre', '/resources/card-scans/kyogre.webp', 'pokemon'],
//     [1, 'pidgeotV', '/resources/card-scans/pidgeotV.webp', 'pokemon'],
//     [1, 'manaphy', '/resources/card-scans/manaphy.webp', 'pokemon'],
//     [1, 'radiantGreninja', '/resources/card-scans/radiantGreninja.webp', 'pokemon'],
//     [1, 'zamazenta', '/resources/card-scans/zamazenta.webp', 'pokemon'],
//     [4, 'metal', '/resources/card-scans/metal.webp', 'energy'],
//     [4, 'water', '/resources/card-scans/water.webp', 'energy'],
//     [3, 'psychic', '/resources/card-scans/psychic.webp', 'energy'],
//     [4, 'colress\'sExperiment', '/resources/card-scans/colress\'sExperiment.webp', 'supporter'],
//     [4, 'battleVipPass', '/resources/card-scans/battleVipPass.webp', 'item'],
//     [4, 'mirageGate', '/resources/card-scans/mirageGate.webp', 'item'],
//     [4, 'switchCart', '/resources/card-scans/switchCart.webp', 'item'],
//     [3, 'escapeRope', '/resources/card-scans/escapeRope.webp', 'item'],
//     [4, 'nestBall', '/resources/card-scans/nestBall.jpg', 'item'],
//     [3, 'superRod', '/resources/card-scans/superRod.webp', 'item'],
//     [2, 'energyRecycler', '/resources/card-scans/energyRecycler.webp', 'item'],
//     [1, 'lostVacuum', '/resources/card-scans/lostVacuum.webp', 'item'],
//     [1, 'echoingHorn', '/resources/card-scans/echoingHorn.jpg', 'item'],
//     [1, 'hisuianHeavyBall', '/resources/card-scans/hisuianHeavyBall.webp', 'item'],
//     [1, 'roxanne', '/resources/card-scans/roxanne.webp', 'supporter'],
//     [1, 'artazon', '/resources/card-scans/artazon.webp', 'stadium'],
//     [1, 'pokestop', '/resources/card-scans/pokestop.webp', 'stadium'],
//     [1, 'beachCourt', '/resources/card-scans/beachCourt.webp', 'stadium'],
//     [2, 'forestSealStone', '/resources/card-scans/forestSealStone.webp', 'tool']
// ];