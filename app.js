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

const displayProfile = (res)=>{
    //Profile pic
    document.querySelector('#profile-pic img').setAttribute('src', `${res.data.viewer.avatarUrl}`);
    document.querySelector('#nav-pic img').setAttribute('src', `${res.data.viewer.avatarUrl}`);
    //Profile name
    const h2 = document.createElement('h2');
    h2.appendChild(document.createTextNode(res.data.viewer.name));
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(res.data.viewer.login));
    document.querySelector('#profile-name').appendChild(h2);
    document.querySelector('#profile-name').appendChild(p);
    //Username for nav
    const username = document.createElement('p');
    username.appendChild(document.createTextNode(res.data.viewer.login));
    document.querySelector('.nav-link:nth-last-child(2)').children[0].insertAdjacentElement('afterend', username);

}

const displayRepos = (res) => {
    //get repos div
    const repos = document.querySelector('#repos'),
          extraRepos = [];
    let html = '';
    let reposArray = res.data.viewer.repositories.nodes;
    reposArray.reverse().forEach(repo => {
        if(repo.name !== 'find-it-frontend'){
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

            console.log((new Date()).getMonth());
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
            </div>`
        }
    });
    repos.innerHTML = html;
    return reposArray; //plus extra repos
}

//Events
const showClose = (e) => {
    //Show and Close Nav
    if(e.target.id === 'menu'){
        e.target.parentElement.nextElementSibling.classList.toggle('d-none')
    }
    //Show Edit Profile
    if(e.target.id === 'edit'){
        e.target.nextElementSibling.classList.remove('d-none');
        e.target.classList.add('d-none');
        e.target.classList.remove('btn');
        console.log(e.target);
    }
    //Close Edit profile
    if(e.target.id === 'cancel'){
        e.target.parentElement.parentElement.previousElementSibling.classList.remove('d-none');
        e.target.parentElement.parentElement.previousElementSibling.classList.add('btn');
        e.target.parentElement.parentElement.classList.add('d-none')
    }
}
const dropDown = (e) => {
    if(e.target.id === 'clear-status'){
        // console.log("hi");
        document.querySelector('#one.dropdown').parentElement.classList.remove('d-none');
    }
    if(e.target.id === 'visible-status'){
        document.querySelector('#two.dropdown').parentElement.classList.remove('d-none');
    }
}    
 
const closeDropdown = (e) => {
        if(!document.querySelector('#one.dropdown').contains(e.target) && !document.querySelector('#one.dropdown').parentElement.classList.contains('d-none') ){
            console.log('hi');
            document.querySelector('#one.dropdown').parentElement.classList.add('d-none');
        }
        if(!document.querySelector('#two.dropdown').contains(e.target) && !document.querySelector('#two.dropdown').parentElement.classList.contains('d-none')){
            document.querySelector('#two.dropdown').parentElement.classList.add('d-none');

    }

        
  
}

const showTypeModal = (e) => {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'container');
    if(e.target.id = 'type'){
        modal.innerHTML = `
        <div class="modal-content">
            <p id="top">Select type<span class="iconify" data-icon="octicon:x-24" data-inline="false" id="close"></span></p>
            <div id="modal-list">
            <div class="modal-item"><span class="iconify" data-icon="octicon:check-16" data-inline="false"></span><p>All</p></div>
                <div class="modal-item"><p>Public</p></div>
                <div class="modal-item"><p>Private</p></div>
                <div class="modal-item"><p>Sources</p></div>
                <div class="modal-item"><p>Forks</p></div>
                <div class="modal-item"><p>Archived</p></div>
                <div class="modal-item"><p>Mirrors</p></div>
            </div>
        </div>`
        document.querySelector('body').insertAdjacentElement('afterbegin', modal);
        document.addEventListener('click', closeModal);
    }
}
const showLangModal = (e, repos) => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    if(e.target.id = 'lang'){
        let langArr = [];
        repos.forEach(repo => {
            if(!langArr.includes(repo.primaryLanguage.name)){
                langArr.push(repo.primaryLanguage.name)
            } 
        });
        let str = '';
        langArr.forEach(x =>{
            str += `<p class="modal-item">${x}</p>`;
        });
        modal.innerHTML = `
        <p id="top">Select type<span class="iconify" data-icon="octicon:x-24" data-inline="false" id="close"></span></p>
        <div id="modal-list">
           ${str}
        </div>`
    }
}
const showStatusModal = (e) => {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'container');
    if(e.target.id = 'status'){
        modal.innerHTML = `
        <div id="status-modal" class="modal">
        <div class="modal-content">
            <p id="top">Edit status<span class="iconify" data-icon="octicon:x-24" data-inline="false" id="close"></span></p>
            <div id="inputs" class="container">
                <div id="wh">
                    <div id="smiley">
                        <span class="iconify" data-icon="octicon:smiley-16" data-inline="false"></span>
                    </div>
                    <input type="text" placeholder="What's happening?">
                </div>
                <div id="checkbox">
                    <input type="checkbox" id="busy" value="">Busy
                </div>
                <p id="p" class="container">When others mention you, assign you, or request your review, GitHub will let them know that you have limited availability.</p>
            </div>
            <div id="options">
                <div class="status">
                    Clear status <a href="#"  class="btn" id="clear-status">Never<i class="fas fa-caret-down"></i></a>
                </div>
                <div class="status">
                    Visible to
                    <a href="#" class="btn" id="visible-status">Everyone<i class="fas fa-caret-down"></i></a>
                </div>
                
            </div>
            <div id="status-btns">
                <a href="#" class="btn bg-green">Set status</a>
                <a href="#" class="btn">Clear status</a>
            </div>
        </div>
        <div class="d-none">
            <div class="dropdown" id="one">
                <a href="#" class="dropdown-option"><p>Never</p><p>Keep this status until you clear your status or edit your status</p></a>
                <a href="#" class="dropdown-option">in 30 minutes</a>
                <a href="#" class="dropdown-option">in 1 hour</a>
                <a href="#" class="dropdown-option">in 4 hours</a>
                <a href="#" class="dropdown-option">today</a>
                <a href="#" class="dropdown-option">this week</a>
            </div>
        </div>
        <div class="d-none">
            <div class="dropdown" id="two">
                <a href="#" class="dropdown-option"><p>Everyone</p><p>Your status will be visible to everyone</p></a>
                <a href="#" class="dropdown-option">CDC Unilag</a>
                
            </div>
        </div>
    </div>`;
        document.querySelector('body').insertAdjacentElement('afterbegin', modal);
        document.addEventListener('click', closeModal);

        document.querySelector('#status-modal').addEventListener('click', (e) => {
            dropDown(e);
            closeDropdown(e)
        });
    }
}
const closeModal = (e) => {
    if(e.target.classList.contains('modal')|| e.target.id === 'close'){
        document.querySelector('.modal').remove();   
    }
}
const showNotification = (e) =>{
    console.log('hi');
}

const main = () =>{
    document.querySelector('body').addEventListener('click', showClose); 
    document.querySelector('#type').addEventListener('click', showTypeModal);
    //lang
    document.querySelector('#status').addEventListener('focus', showStatusModal);
    document.querySelector('#header').addEventListener('click', showNotification );
    console.log( document.querySelector('#header a:nth-child(3)'));

    getData('{viewer {login avatarUrl name repositories(last:12){totalCount nodes{name updatedAt primaryLanguage{name}}}}}')
        .then(response => {
            displayProfile(response);
            displayRepos(response);
            document.querySelector('#lang').addEventListener('mouseover', (e, response) => {
                showLangModal(e, response);
            });
        });
    }


main();
//status modal              hd. need internet to determine functionality and mouseover is not working to color smiley. cant do dropdown
//edit profile           hd
//star unstar
//typeall               hd
//language all          hd
//icons in input
//btns dropdown         hd
//smiley           d
//remaining repos
//date
//catch
//username in nav       hd
//outline
//organzatn in status
//set transition





// const user = 'are-ike'
// const clientId = 'cc97d2fddef52491af28';
// const clientSecret = 'ee3b2fd287cb62d19bdce442df93a42a4afcbf6b';
// fetch(`https://api.github.com/users/${user}?client_id=${this.clientId}&client_secret=${this.clientSecret}/repos`)
// .then(res => res.json())
// .then(res => console.log(res));
