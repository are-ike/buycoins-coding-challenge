// const fetch = require('node-fetch');
// import fetch from 'node-fetch';

async function getData(string){
    try{
        const response = await fetch('https://api.github.com/graphql',
        {method: "POST",
        headers: {'Authorization' : 'bearer 79736b679c9b0c3d130fe8ab40c5d61ce4699b11'},
        body: JSON.stringify({query : string})
        });
        const json = await response.json();

        return json;
    }catch(e){
        console.log(e);
        return;
    }
}

const largeScreen = () => {
    if(window.innerWidth >= 768){
        //Position Nav
        const nav = document.querySelector('nav');
        const header = document.querySelector('#header .header-group:nth-child(2)')
        header.appendChild(nav);

        //Editing nav-link
        document.querySelector('.nav-link:nth-child(3)').textContent = 'Pulls';

    }else{
        //Reposition nav
        const nav = document.querySelector('nav');
        const header = document.querySelector('header')
        header.appendChild(nav);

        //Editing nav-link
        document.querySelector('.nav-link:nth-child(3)').textContent = 'Pull requests';


    }
    
}

const displayStatus = (res) => {
    const {message, emojiHTML} = res.data.viewer.status,
          status = document.querySelector('#status'),
          div = document.createElement('div');
    div.classList.add('status-emoji');
    div.innerHTML = emojiHTML;

    status.replaceChild(div, status.children[0]);
    document.querySelector('.status-emoji').nextSibling.remove();
    status.appendChild(document.createTextNode(message));
}
const displayProfile = (res)=>{
    //Profile pic
    document.querySelector('#profile-pic img').setAttribute('src', `${res.data.viewer.avatarUrl}`);
    document.querySelectorAll('.nav-pic img').forEach(pic => {
        pic.setAttribute('src', `${res.data.viewer.avatarUrl}`);
    });

    //Profile name
    const h2 = document.createElement('h2');
    h2.appendChild(document.createTextNode(res.data.viewer.name));
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(res.data.viewer.login));
    document.querySelector('#profile-name').appendChild(h2);
    document.querySelector('#profile-name').appendChild(p);

    //Info
    const {bio, company, location, websiteUrl, twitterUsername} = res.data.viewer;
    
    const info = [company, location, websiteUrl, twitterUsername];

    if(company !== null){
        document.querySelector('#company').innerHTML = `<span class="iconify" data-icon="octicon:organization-16" data-inline="false"></span>${company}`;
    }
    if(location !== null){
        document.querySelector('#location').innerHTML = `<span class="iconify" data-icon="octicon:location-16" data-inline="false"></span>${location}`;
    }
    if(websiteUrl !== null){
        document.querySelector('#site').innerHTML = `<span class="iconify" data-icon="octicon:link-16" data-inline="false"></span>${websiteUrl}`;
    }
    if(twitterUsername !== null){
        document.querySelector('#twitter_username').innerHTML = `<i class="fab fa-twitter"></i>@${twitterUsername}`;
    }

    document.querySelectorAll('.form-group input').forEach((x, i) => {
        if(info[i] !== null){
            x.value = info[i];
        }
    });

    if(bio !== null){
        document.querySelector('.bio').textContent = bio;
        document.querySelector('.bio').style.display = 'block';
        document.querySelector('textarea').value = bio;
    }
    editProfileFunctionality()
    
    //Username for nav
    const username = document.createElement('p');
    username.appendChild(document.createTextNode(res.data.viewer.login));
    document.querySelector('.nav-link:nth-last-child(2)').children[0].insertAdjacentElement('afterend', username);

}

const displayRepos = (res) => {
    //get repos div
    let reposArray = res.data.viewer.repositories.nodes;
    const repos = document.querySelector('#repos'),
          extraRepos = reposArray;
    console.log(extraRepos);
    let html = '';
    reposArray.reverse().concat(extraRepos).forEach((repo, i) => {
        if(repo.name !== 'find-it-frontend' && i < 21){
        //Setting lang color
            let color = repo.primaryLanguage.name === 'JavaScript' ? 'yellow': 'purple';

        //Updated at
            let date = (new Date(repo.updatedAt)).toDateString();//converting date to string
            date = date.split(' '); //converting date string to array
            date.shift(); //removing day

            //removing leading zeros
            if(date[1][0] == 0){ 
                date[1] = date[1].slice(1);
            }
            //if updated less than a month ago&repository count

            
            //removing year if current year
            let newDate = '';
            if((new Date()).getFullYear() == date[2]){
                date.pop(); //remove year
            }
            date.forEach(x => {
                newDate += `${x} `;
            });
            // console.log(newDate);
            
            html += `
            <div class="repo">
                <div id="repo-desc">
                    <h3><a href="#" class="repo-name">${repo.name}</a></h3>
                    <div class="desc">
                        <p><span class="${color} repo-language"></span> ${repo.primaryLanguage.name}</p><p>Updated 17 days ago</p>
                    </div>
                </div>
                <a href="#" class="btn star"><span class="iconify" data-icon="octicon:star-16" data-inline="false"></span>Star</a>
            </div>`;

            
        }
    });
    repos.innerHTML = html;

    //Star 
    const unstar = '<span class="iconify unstar" data-icon="octicon:star-fill-16" data-inline="false"></span>Unstar',
          star = '<span class="iconify" data-icon="octicon:star-16" data-inline="false"></span>Star';
    document.querySelectorAll('.star').forEach((s, i) => {
        s.addEventListener('click', (e) => {
            if(s.children[0].classList.contains('unstar')){
                s.innerHTML = star;
                s.style.padding = '.3rem 0';
                s.style.width = '67px';
            }else{
                s.innerHTML = unstar; 
                s.style.padding = '.3rem .4rem';
                s.style.width = '80px';
           }
           e.preventDefault();
        });

    });
    return reposArray.reverse().concat(extraRepos); //plus extra repos
}

//Events
const nav = (e) => {
    //Show and Close Nav
    if(e.target.id === 'menu'){
        e.target.parentElement.nextElementSibling.classList.toggle('d-none')
    }
    
}

const editProfileFunctionality = () => {
    const saveBtn = document.querySelector('#save'),
          cancelBtn = document.querySelector('#cancel'),
          editBtn = document.querySelector('#edit');

    saveBtn.addEventListener('click', (e) => {
        close(e);
        save();
    });
    cancelBtn.addEventListener('click', close);
    editBtn.addEventListener('click', show);

    function save (){
        //Bio
        const bio = document.querySelector('.bio');
        if(document.querySelector('textarea').value !== ''){
            bio.textContent = document.querySelector('textarea').value;
            bio.style.display = 'block';
        }else{
            bio.style.display = 'none';
        }

        //Display Info
        document.querySelectorAll('.form-group input').forEach((x, i) => {
            if(x.value !== ''){
                const infoItem = document.querySelector(`.info-item:nth-child(${i + 1})`);
                if(infoItem.hasChildNodes() === false){
                    const icon =  x.previousElementSibling.cloneNode(true);
                    infoItem.appendChild(icon);
                    
                    if(x.placeholder == 'Twitter username'){
                        infoItem.appendChild(document.createTextNode(`@${x.value}`));
                    }else{
                        infoItem.appendChild(document.createTextNode(x.value));
                    }
                }else{
                    if(x.placeholder == 'Twitter username'){
                        infoItem.replaceChild(document.createTextNode(`@${x.value}`), infoItem.childNodes[1]);
                    }else{
                        infoItem.replaceChild(document.createTextNode(x.value), infoItem.childNodes[1]);
                    }

                }
                // if(infoItem.style.display === 'none'){
                //     infoItem.style.display = 'block'
                // }
            }else{
                document.querySelector(`.info-item:nth-child(${i + 1})`).innerHTML= '';
            }
        });

    }
    //Show Edit Profile
    function show(e){
        if(e.target.id === 'edit'){
            e.target.nextElementSibling.classList.remove('d-none');
            e.target.classList.add('d-none');
            e.target.classList.remove('btn');
        }
    }
    //Close Edit profile
    function close(e){
        if(e.target.id === 'cancel'|| e.target.id === 'save'){
            e.target.parentElement.parentElement.previousElementSibling.classList.remove('d-none');
            e.target.parentElement.parentElement.previousElementSibling.classList.add('btn');
            e.target.parentElement.parentElement.classList.add('d-none')
        }
    }
}

const modalFunctionality = (btnId, modalId) =>{
    document.querySelectorAll(`#${modalId} .modal-item`).forEach(item => {
        item.addEventListener('click', () => {
            document.querySelector(`#${modalId} .modal-item .iconify`).nextElementSibling.classList.remove('checked');
            document.querySelector(`#${modalId} .modal-item .iconify`).remove();
            const p = item.firstChild;
            p.classList.add('checked');
            item.innerHTML = '<span class="iconify" data-icon="octicon:check-16" data-inline="false"></span>';
            item.appendChild(p);

            document.querySelector(`#${btnId} .checked-value`).textContent = p.textContent;
            document.querySelector(`#${modalId}`).parentElement.classList.add('d-none');
 
        });
    });
}
const showModal = (e, btnId, modalId ) => {
    if(e.target.id === btnId || document.querySelector(`#${btnId}`).contains(e.target)){
        document.querySelector(`#${modalId}`).parentElement.classList.remove('d-none');

        modalFunctionality(btnId, modalId);
       //Close modal
       closeModal(modalId);
    }
}

const showStatusModal = (e) => {
    if(e.target.id = 'status'){
        document.querySelector('#status-modal').parentElement.classList.remove('d-none');
        statusFunctionality();

        //Close modal
        closeModal('status-modal');
    }
}

const statusFunctionality = () => {
    //Suggestions
    const input = document.querySelector('#wh input'),
          suggestions = document.querySelector('#suggestions'),
          smiley = document.querySelector('#wh #smiley'),
          setBtn = document.querySelector('#setBtn'),
          clrBtn = document.querySelector('#clr'),
          statusModal = document.querySelector('#status-modal');

    input.addEventListener('focus', displaySuggestions);
    input.addEventListener('keyup', displaySuggestions);
    setBtn.addEventListener('click', setStatus);
    clrBtn.addEventListener('click', clrStatus);
    statusModal.addEventListener('click', dropDown);
    statusModal.addEventListener('mouseover', (e) =>{
        if(smiley.contains(e.target)){
            smiley.children[0].style.color = 'white';
        }else{
            smiley.children[0].style.color = '#586069';
        }
    })
    

    suggestions.addEventListener('click', (e) => {
        if(e.target.id = 'suggestion'){
            input.value = e.target.textContent; 
            smiley.innerText = e.target.previousElementSibling.textContent;
            displaySuggestions();
        }
    });

    function displaySuggestions(){
        if(input.value === ''){
            suggestions.style.display = 'grid';
            setBtn.classList.add('set');
        }else{
            suggestions.style.display = 'none';
            setBtn.classList.remove('set');
        }
    }

    //Busy
    document.querySelector('#busy').addEventListener('click', (e) => {
        if(input.value === ''){
            input.value = 'I may be slow to respond'; 
            setBtn.classList.remove('set');
            if(suggestions.style.display !== 'none'){
                suggestions.style.display = 'none';
            }
        }else if(input.value === 'I may be slow to respond'){
            input.value = '';
            suggestions.style.display = 'grid';
            setBtn.classList.add('set');
        }       
    });
    
    //Set status
    const status = document.querySelector('#status'),
          div = document.createElement('div'),
          icon = status.children[0];
          

    async function mutateStatus(string){
        try{
            const response = await fetch('https://api.github.com/graphql',
            {method: "POST",
            headers: {'Authorization' : 'bearer 79736b679c9b0c3d130fe8ab40c5d61ce4699b11'},
            body: JSON.stringify({query : string})
            });
            const json = await response.json();
    
            return json;
        }catch(e){
            console.log(e);
            return;
        }
    }
    function setStatus(){
        if(!setBtn.classList.contains('set')){
            //Expires At
            const option = document.querySelector('#clear-status').childNodes[0].textContent;
            let time;
            switch(option){
                case 'Never':
                    console.log('hi');
                    break;
                case 'in 30 minutes':
                    time = 30 * 60;
                case 'in 1 hour':
                    time = 60 * 60;
                case 'today':
                    time = 'wait';

                case 'this week':
                    time = 'sigh'
            }
            //write break
            //do the calculation with time
            //call mutate status

            div.classList.add('status-emoji');
            status.style.height = '30px';

            if(smiley.children.length === 1){
                div.appendChild(document.createTextNode('💭'));
            }else{
                div.appendChild(document.createTextNode(smiley.textContent));    
            }
            status.replaceChild(div, status.children[0]);
            document.querySelector('.status-emoji').nextSibling.remove();
            status.appendChild(document.createTextNode(input.value));

            //Mutate Status
            // mutateStatus(`mutation{changeUserStatus(input: {message:"${input.value}", expiresAt: "2020-11-22T22:04:00Z"}){ status{message expiresAt}}}`).then(x => {
            //     console.log(x);
            // });

            
            //Store Emoji
            localStorage.setItem('emoji', `${div.childNodes[0].textContent}`);
            //Close Modal
            document.querySelector('#status-modal').parentElement.classList.add('d-none');  
            
        }
    }
/**Only members of CDC-Unilag will be able to see your status. main
 * closes to original choice in dropdown is same
*/
    //Clear status
    function clrStatus(){
        document.querySelector('#status-modal').parentElement.classList.add('d-none');
        status.replaceChild(icon, status.children[0]);
        icon.nextSibling.remove();
        status.appendChild(document.createTextNode('Set status'));
    }

    //Dropdown
    function dropDown(e){
        if(e.target.id === 'clear-status'){
            document.querySelector('#one.dropdown').parentElement.classList.remove('d-none');
            dropdownFunctionality('#one.dropdown', 'clear-status');  
        }
        if(e.target.id === 'visible-status'){
            document.querySelector('#two.dropdown').parentElement.classList.remove('d-none');
            dropdownFunctionality('#two.dropdown', 'visible-status');
        }
    }    
     
    function dropdownFunctionality(str, id){
        document.querySelector('#status-modal').addEventListener('click', (e) =>{
            //Close dropdown
            if(!document.querySelector(`${str}`).contains(e.target)){
                document.querySelector(`${str}`).parentElement.classList.add('d-none');
            }else{
                chooseOption(e, id);
            }
           
        });
    }

    function chooseOption(e, id){
        document.querySelector(`#${id}`).childNodes[0].remove();
        document.querySelectorAll('.first-option').forEach(x => {
            if(e.target.classList.contains('first-option') || x.contains(e.target)){
                document.querySelector(`#${id}`).insertBefore(document.createTextNode(x.children[0].textContent), document.querySelector(`#${id}`).children[0]);
            }
        });
        if(document.querySelector('#org').contains(e.target) || e.target.id == 'org-img' || e.target.id == 'org'){
            document.querySelector(`#${id}`).insertBefore(document.createTextNode(document.querySelector('#org').nextSibling.textContent), document.querySelector(`#${id}`).children[0]);
        }
        if(e.target.classList.contains('dropdown-option')){
            document.querySelector(`#${id}`).insertBefore(document.createTextNode(e.target.textContent), document.querySelector(`#${id}`).children[0]);
        }
    }
}
const closeModal = (modalId) => {
    document.addEventListener('click', (e) => {
        if(e.target.classList.contains('modal')|| e.target.id === 'close'){
            document.querySelector(`#${modalId}`).parentElement.classList.add('d-none');   
        }
    });
}
const showNotification = (e) =>{
    console.log('hi');
}

const main = () =>{
    window.addEventListener('resize', largeScreen);
    if(innerWidth >= 768){
        largeScreen()
    }
    document.querySelector('body').addEventListener('click', nav); 
    document.addEventListener('click', (e) => {
        showModal(e, 'type', 'type-all');
        showModal(e, 'lang', 'lang-all');
    });
    //lang
    
    document.querySelector('#status').addEventListener('click', showStatusModal);
    // statusFunctionality(); //should be in status modal
    // EditProfileFunctionality();
    document.querySelector('#header').addEventListener('mouseover', showNotification );


    getData('{viewer {login avatarUrl name repositories(last:15){totalCount nodes{name updatedAt primaryLanguage{name}}}status{message expiresAt emojiHTML} bio company location websiteUrl twitterUsername}}')
        .then(response => {
            displayProfile(response);
            displayStatus(response);
            displayRepos(response);
        })
        .catch(err => console.log(err));
}
    

main();
/**
 *shownoti
 * 
 * set status and info with api
 * 
 */
/**Status 
 * reposition dropdowm nd dropdown

*/
/**Edit Profile
 * 
 * 
 */
/**Repo
 

 
 * updated at
 */
/**Language all

 * 
 */
/**type all
 
 * fix btn to accomodate
 */
/**Style
 * outline
 * transition
 * 
 */

/**lg */

/**
 
 * hover color for plus and img
 * dropdown padding
 * star position
 * star following
 * 
 * destructure
 * ************
 * create setbio etc
 * emoji options
 * tab border
 */
