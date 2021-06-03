let entries = [];

//Sets up and controls error in new pizza form
class Error{

    static initialize(){
        this.errorMessage = document.getElementById('errorMessage');
    }

    static throw(text){
        this.lastThrow = new Date();
        this.errorMessage.classList.add('visible');
        this.errorMessage.innerText = text;
        setTimeout(() => {
            const now = new Date();
            
            if(now - this.lastThrow >= 4990) this.hide();
        }, 5000);
    }
    
    static hide(){
        this.errorMessage.classList.remove('visible');
    }
}

//Controls the pizza adding form
class AddPizza{

    static initialize(){
        this.inputMenu = document.getElementById('inputWindow');
        this.selectedImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/200px-Question_mark_%28black%29.svg.png';

        this.addPizzaButton = document.getElementById('addPizzaButton');
        this.addPizzaButton.addEventListener('click', e => {
            this.inputMenu.style.display = 'inline';
        });

        this.closeMenu = document.getElementById('close');
        this.closeMenu.addEventListener('click', e => {
            this.inputMenu.style.display = 'none';
        });

        this.pizzaImages = document.getElementById('pizzaImages').children;
        for(var i = 0; i < 3; i++){
            AddPizza.pizzaImageScript(this.pizzaImages[i]);
        }

        this.confirmationButton = document.getElementById('confirmation');
        this.confirmationButton.addEventListener('click', e => {
            AddPizza.validate();
        })
    }

    static pizzaImageScript(element){
        element.addEventListener('click', e => {
           for(var i = 0; i < 3; i++){
               this.pizzaImages[i].classList.remove('selected');
           } 
           element.classList.add('selected');
           this.selectedImage = element.style.backgroundImage.slice(5, -2);
        });
    }

    static validate(){
        const userInputs = document.getElementById('inputWindow').children;
        const name = userInputs[4].value;
        const price = userInputs[6].value;
        const heat = userInputs[8].value;
        const toppings = userInputs[10].value.trim();

        if(heat == null) heat = 0;
        
        var toppingArray = [];
        var last = 0;
        for(var i = 0; i < toppings.length; i++){
            if(toppings[i] == ','){
                toppingArray.push(toppings.slice(last, i));
                last = i + 1;
            }
        }
        toppingArray.push(toppings.slice(last, toppings.length));

        var uniqueName = true;
        entries.forEach(entry => {
            if(entry.name == name) uniqueName = false;
        });

        if(name == '') Error.throw('Name cannot be blank');
        else if(uniqueName == false) Error.throw('A pizza with that name already exists');
        else if(name.length > 30) Error.throw('Name cannot be that long');
        else if(price == '') Error.throw('Enter a price');
        else if(price < 0) Error.throw('Price cannot be negative');
        else if(price[price.length - 3] != '.') Error.throw('Price must be to 2 decimal places');
        else if(heat !== '' && heat !== '1' && heat !== '2' && heat !== '3') Error.throw('Heat must be an integer from 1 to 3');
        else if(toppingArray.length < 2) Error.throw('Pizza must have at least 2 toppings');
        else{
            this.inputMenu.style.display = 'none';
            const newPizza = {
                name: name,
                price: price,
                heat: heat,
                toppings: toppingArray,
                image: this.selectedImage
            }

            userInputs[4].value = '';
            userInputs[6].value = '';
            userInputs[8].value = '';
            userInputs[10].value = '';
            this.selectedImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/200px-Question_mark_%28black%29.svg.png';
            for(var i = 0; i < 3; i++){
                this.pizzaImages[i].classList.remove('selected');
            } 

            entries.push(newPizza);
            sessionStorage.setItem('entries', JSON.stringify(entries));
            ListContents.addNew(newPizza, true);
        }
    }
}

//Controls adding/removing entries in the list (menu)
class ListContents{
    static initialize(){
        this.deletionPopup = document.getElementById('deletionPopup');
        this.deletionConfirmation = document.getElementById('confirmDeletion');
        const deleteCancellation = document.getElementById('cancelDeletion');

        deleteCancellation.addEventListener('click', e => {
            this.deletionPopup.style.display = 'none';
        });

        this.deletionConfirmation.addEventListener('click', e => {
            this.deletionPopup.style.display = 'none';
            ListContents.delete(this.toBeDeleted);
        });

        entries = JSON.parse(sessionStorage.getItem('entries'));
        if(entries == null) entries = [];
        if(entries) entries.forEach(previouslyAddedPizza => {
            ListContents.addNew(previouslyAddedPizza, false);
        });
    }

    static addNew(newPizza, sortingNeeded){

        const pizzaList = document.getElementById('pizzaList');
        var newEntry = document.createElement('li');

        var toppingString = '';
        newPizza.toppings.forEach(topping => {
            toppingString += `${topping}, `;
        });
        toppingString = toppingString.substring(0, toppingString.length - 2);

        var chilliString = '';
        for(var i = 0; i < newPizza.heat; i++){
            chilliString += "<div class = 'chilliPepper'></div>";
        }

        newEntry.setAttribute('name', newPizza.name);
        newEntry.setAttribute('price', newPizza.price);
        newEntry.setAttribute('heat', newPizza.heat);
        newEntry.classList.add('pizzaEntry');
        newEntry.innerHTML = 
        `
        <div class = 'deletePizza close'>X</div>
        <div class = 'menuImage' style = 'background-image: url("${newPizza.image}")'></div>
        <div class = 'nameAndHotness'>
            <span>${newPizza.name}</span>
            ${chilliString}
        </div>
            <span class = 'menuToppings'>${toppingString}</span>
            <span class = 'price'>€${newPizza.price}</span>
        `;

        newEntry.firstElementChild.addEventListener('click', e => {
            ListContents.confirmDeletion(newEntry.getAttribute('name'));
        });
        pizzaList.appendChild(newEntry);

        if(sortingNeeded == true) ListSorting.sortList();
    }

    static confirmDeletion(name){
        this.toBeDeleted = name;
        this.deletionPopup.firstElementChild.nextElementSibling.innerText = `Are you sure you want to delete "${name}"?`;
        this.deletionPopup.style.display = 'inline';
    }

    static delete(name){
        const pizzaToDelete = document.querySelector(`[name = '${name}']`);
        pizzaToDelete.remove();

        for(var i = 0; i < entries.length; i++){
            if(entries[i].name == name){
                entries.splice(i, 1);
                break;
            }
        }

        sessionStorage.setItem('entries', JSON.stringify(entries));
    }
}

//Controls all actions revolving around sorting the list (menu)
class ListSorting{
    static initialize(){
        this.sortingSetting = sessionStorage.getItem('sortingSetting');
        if(this.sortingSetting == null){
            this.sortingSetting = 'alphabetically';
            sessionStorage.setItem('sortingSetting', 'alphabetically');
        }

        this.sortingOptions = document.getElementById('sortingOptions');
        document.getElementById('sortButton').addEventListener('click', e => {
            this.sortingOptions.classList.toggle('visible');
        });
        
        for(var i = 0; i < 5; i++){
            ListSorting.addOptionClickEvent(sortingOptions.children[i]);
        }

        ListSorting.sortList();
    }

    static addOptionClickEvent(option){
        option.addEventListener('click', e => {
            const sortingSetting = option.getAttribute('sortingSetting');
            sessionStorage.setItem('sortingSetting', sortingSetting);
            this.sortingOptions.classList.toggle('visible');
            ListSorting.sortList();
        });
    }

    static sortList(){
        var pizzas = entries;

        const sortingSetting = sessionStorage.getItem('sortingSetting');
        
        switch(sortingSetting){
            case 'alphabetically':
                pizzas.sort((a, b) => {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                });
            break;
            case 'priceUp':
                pizzas.sort((a, b) => a.price - b.price);
            break;
            case 'priceDown':
                pizzas.sort((a, b) => b.price - a.price);
            break;
            case 'heatDown':
                pizzas.sort((a, b) => b.heat - a.heat);
            break;
            case 'heatUp':
                pizzas.sort((a, b) => a.heat - b.heat);
            break;
        }

        document.getElementById('pizzaList').innerHTML = '';
        pizzas.forEach(pizza => {
            ListContents.addNew(pizza, false);
        });
    }
}

Error.initialize();
ListContents.initialize();
ListSorting.initialize();
AddPizza.initialize();