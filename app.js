async function getToken(){
    return process.env.API_KEY
}
async function getData(string){
    try{
        const response = await fetch('https://api.github.com/graphql',
        {method: "POST",
        headers: {'Authorization' : `bearer ${process.env.API_KEY}`},
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
        if(window.innerWidth >= 1012){
            document.querySelector('.nav-link:nth-child(3)').textContent = 'Pull requests';
            document.querySelector('nav').style.width= '690px';
        }else{
            document.querySelector('.nav-link:nth-child(3)').textContent = 'Pulls';
            document.querySelector('nav').style.width= '600px';
        }

        //Position Following
        const profile = document.querySelector('#profile');
        profile.insertBefore(document.querySelector('#fllw').parentElement, profile.children[5]);
        document.querySelector('#fllw').style.marginTop = '1rem';

        //Tab
        document.querySelector('.main').insertBefore(document.querySelector('.fixed-nav'), document.querySelector('.display'));

        //Status
        document.querySelector('.status:nth-child(2)').addEventListener('mouseenter', showStatus)
        document.querySelector('.status:nth-child(2)').addEventListener('mouseleave', hideStatus)

        document.querySelector('.status:nth-child(2)').style.width = '40px';
        document.querySelector('.status:nth-child(2)').firstChild.style.marginRight = '1rem';

        //Nav
        document.addEventListener('scroll', fixedNav);

        //Org
        document.querySelector('#org-container').parentElement.classList.remove('d-none');

    }else{
        //Reposition nav
        const nav = document.querySelector('nav');
        const header = document.querySelector('header')
        header.appendChild(nav);

        //Editing nav-link
        document.querySelector('.nav-link:nth-child(3)').textContent = 'Pull requests';

        //Position Following
        const profile = document.querySelector('#profile');
        profile.insertAdjacentElement('beforeend', document.querySelector('#fllw').parentElement);
        document.querySelector('#fllw').style.marginTop = '0.5rem';

        //Tab
        document.querySelector('#left').insertAdjacentElement('afterend', document.querySelector('.fixed-nav'));

        //Status
        document.querySelector('.status:nth-child(2)').removeEventListener('mouseenter', showStatus);
        document.querySelector('.status:nth-child(2)').removeEventListener('mouseleave', hideStatus);
        document.querySelector('.status:nth-child(2)').style.width = '100%';
        document.querySelector('.status:nth-child(2)').firstChild.style.marginRight = '0.5rem';

         //Nav
         document.removeEventListener('scroll', fixedNav);

        //Org
        document.querySelector('#org-container').parentElement.classList.add('d-none');

    }

}
const headerHover = (num, color) => {
    const icons = Array.from(document.querySelector(`.header-group:nth-child(3) a:nth-child(${num})`).children);
    icons.forEach(icon => {
        icon.style.color = color;
    });
}
const displayStatus = (res) => {
    if(res.data.viewer.status !== null){
        let {message, emojiHTML} = res.data.viewer.status,
            status = document.querySelectorAll('.status');
            if(emojiHTML === null){
                emojiHTML = '💭';
            }


        status.forEach((x, i) => {
            const div = document.createElement('div');
            div.classList.add('status-emoji');
            div.innerHTML = emojiHTML;
            x.replaceChild(div, x.children[0]);
            document.querySelectorAll('.status-emoji')[i].nextSibling.remove();
            x.appendChild(document.createTextNode(message));
        });
    }
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
    const username2 = username.cloneNode(true);
    const username3 = username2.cloneNode(true);
    username2.classList.add('bold');
    username3.classList.add('bold');
    document.querySelector('.nav-link:nth-last-child(2)').children[0].insertAdjacentElement('afterend', username);
    document.querySelector('.nav-dropdown section:nth-child(1)').appendChild(username2);
    document.querySelector('#nav-p').appendChild(username3);
}
const displayPrivate =(repos) => {
    repos.forEach(repo => {
        if(repo.isPrivate === true){
            document.querySelectorAll('.repo-name').forEach(name => {
                if(name.textContent === repo.name){
                    const span = document.createElement('span');
                    span.textContent = 'Private';
                    span.classList.add('private');
                    name.insertAdjacentElement('afterend', span);
                }
            })
        }
    });
}
const displayDesc = (repos) => {
    repos.forEach(repo => {
        if(repo.description !== null){
            document.querySelectorAll('.repo-name').forEach(name => {
                if(name.textContent === repo.name){
                    const p = document.createElement('p');
                    p.textContent = repo.description;
                    p.classList.add('description');
                    name.parentElement.insertAdjacentElement('afterend', p);
                }
            })
        }
    });
}
const displayRepos = (res) => {
    //get repos div
    let reposArray = res.data.viewer.repositories.nodes;
    const repos = document.querySelector('#repos');
    let html = '';
    reposArray.reverse().forEach((repo, i) => {
        if(repo.owner.login === 'are-ike' && i < 21){
        //Setting lang color
            let color = repo.primaryLanguage.name === 'JavaScript' ? 'yellow': 'purple';

        //Updated at
        let newDate;
        if(dateFns.differenceInMonths(new Date(), repo.updatedAt) > 0){
            let date = (new Date(repo.updatedAt)).toDateString();//converting date to string
            date = date.split(' '); //converting date string to array
            date.shift(); //removing day

            //removing leading zeros
            if(date[1][0] == 0){
                date[1] = date[1].slice(1);
            }
            //removing year
            let day;
            if(dateFns.getYear(new Date()) == dateFns.getYear(repo.updatedAt)){
                date.pop();
                day = `${date[0]} ${date[1]}`;
            }else{
                day = `${date[0]} ${date[1]} ${date[2]}`;
            }
            newDate = `Updated on ${day}`;

        }else{
            newDate = `Updated ${dateFns.differenceInDays(new Date(), repo.updatedAt)} days ago`;
        }

            html += `
            <div class="repo">
                <div id="repo-desc">
                    <h3><a href="#" class="repo-name">${repo.name}</a></h3>
                    <div class="desc">
                        <p><span class="${color} repo-language"></span> ${repo.primaryLanguage.name}</p>
                        <p>${newDate}</p>
                    </div>
                </div>
                <a href="#" class="btn star"><span class="iconify" data-icon="octicon:star-16" data-inline="false"></span>Star</a>
            </div>`;


        }
    });
    repos.innerHTML = html;

    //Private
    displayPrivate(reposArray);

    //Description
    displayDesc(reposArray);

    //Repo Count
    document.querySelector('.counter').textContent = document.querySelectorAll('.repo').length;

    //Star
    star(reposArray);

    return reposArray.reverse();
}
const star = (reposArray) => {
    const unstar = '<span class="iconify unstar" data-icon="octicon:star-fill-16" data-inline="false"></span>Unstar',
          star = '<span class="iconify" data-icon="octicon:star-16" data-inline="false"></span>Star';
    document.querySelectorAll('.star').forEach((s, i) => {
        s.addEventListener('click', (e) => {
             //Get ID
            let id;
                reposArray.forEach(repo => {
                    if(document.querySelectorAll('.repo-name')[i].textContent === repo.name){
                        id = repo.id;
                    }
                });
            if(s.children[0].classList.contains('unstar')){
                s.innerHTML = star;
                s.style.padding = '.3rem 0';
                s.style.width = '67px';
                getToken().then(res => {
                    add_removeStar(`mutation{removeStar(input: {starrableId: "${id}"}){starrable{id}}}`)
                    .then(() => {
                        getData('{viewer{starredRepositories{nodes{name viewerHasStarred stargazerCount}} followers{totalCount}following{totalCount}}}')
                        .then(res => {
                            displayStarredRepos(res);
                        })
                    })
                })
                .catch(err => console.log(err));

            }else{
                s.innerHTML = unstar;
                s.style.padding = '.3rem .4rem';
                s.style.width = '80px';

                getToken().then(res => {
                    add_removeStar(`mutation{addStar(input: {starrableId: "${id}"}){starrable{id}}}`)
                    .then(() => {
                        getData('{viewer{starredRepositories{nodes{name viewerHasStarred stargazerCount}} followers{totalCount}following{totalCount}}}')
                        .then(res => {
                            displayStarredRepos(res);
                        })
                    })
                })
                .catch(err => console.log(err));
           }


           e.preventDefault();
        });

    });
}
const displayStarredRepos = (res) => {
    const {starredRepositories} = res.data.viewer;
    if(document.querySelector('.stargazer-count')){
        document.querySelectorAll('.stargazer-count').forEach(x => {
            x.parentElement.remove();
        });
    }
    showFollowing(res);
    if(starredRepositories.nodes.length !== 0){
        const nodes = starredRepositories.nodes;
        nodes.forEach(node => {
            document.querySelectorAll('.repo').forEach(repo => {
                if(node.name === repo.children[0].children[0].children[0].textContent){
                    const icon = document.querySelector('.group:nth-child(5)').children[0].cloneNode(true);
                    const p = document.createElement('p'),
                          span = document.createElement('span');
                    span.classList.add('stargazer-count');
                    span.textContent = node.stargazerCount;

                    p.appendChild(icon);
                    p.appendChild(span);
                    repo.children[0].children[1].insertBefore(p, repo.children[0].children[1].children[1]);

                    if(node.viewerHasStarred === true){
                        const star = repo.children[repo.children.length - 1];
                        star.innerHTML =
                        '<span class="iconify unstar" data-icon="octicon:star-fill-16" data-inline="false"></span>Unstar';
                        star.style.padding = '.3rem .4rem';
                        star.style.width = '80px';
                    }

                }
            });
        });




    }
}
const nav = (e) => {
    //Show and Close Nav
    if(e.target.id === 'menu'){
        document.querySelector('nav').classList.toggle('d-none');
    }
}
const fixedNav = () => {
    if(window.scrollY >= 86){
        document.querySelector('.fixed-nav').classList.add('fixed');
        document.querySelector('#search').style.marginTop = '1.5rem'
    }else{
        document.querySelector('.fixed-nav').classList.remove('fixed')
        document.querySelector('#search').style.marginTop = '0'
    }
    if(document.querySelector('#profile-pic img').getBoundingClientRect().bottom < 0){
        document.querySelector('#nav-p').parentElement.classList.remove('d-none');
    }else{
        document.querySelector('#nav-p').parentElement.classList.add('d-none');
    }
}
const showFollowing = (res) =>{
    const {following, followers, starredRepositories} = res.data.viewer;
    if(starredRepositories.nodes.length !== 0){
        document.querySelector('#fllw').parentElement.classList.remove('d-none');
        document.querySelectorAll('.count')[0].textContent = following.totalCount;
        document.querySelectorAll('.count')[1].textContent = followers.totalCount;
        document.querySelector('.star-count').textContent = starredRepositories.nodes.length;

    }
    else{
        document.querySelector('#fllw').parentElement.classList.add('d-none');
    }
    // Hover
    document.querySelectorAll('.group').forEach(grp => {
        grp.addEventListener('mouseenter', () => {
            grp.children[grp.children.length - 1].children[0].style.color = '#0366d6';
        })
        grp.addEventListener('mouseleave', () => {
            grp.children[grp.children.length - 1].children[0].style.color = '#24292e';
        });
    });
}
async function add_removeStar(string){
    try{
        const response = await fetch('https://api.github.com/graphql',
        {method: "POST",
        headers: {'Authorization' : `bearer ${process.env.API_KEY}`},
        body: JSON.stringify({query : string})
        });
        const json = await response.json();

        return json;
    }catch(e){
        console.log(e);
        return;
    }
}
const editProfileFunctionality = () => {
    const saveBtn = document.querySelector('#save'),
          cancelBtn = document.querySelector('#cancel'),
          editBtn = document.querySelector('#edit');

    saveBtn.addEventListener('click', (e) => {
        close(e);
        save(e);
        e.preventDefault();
    });
    cancelBtn.addEventListener('click', close);
    editBtn.addEventListener('click', show);

    function save (e){
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
                if(i !== 3){
                    const infoItem = document.querySelector(`.info-item:nth-child(${i + 1})`);
                }else{
                    const infoItem = document.querySelector(`.info-item:star-nth-child(${i + 1})`);

                }
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
        e.preventDefault();
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
        e.preventDefault();
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
const showStatus = () => {
    document.querySelector('.status:nth-child(2)').style.width = 'auto';
    document.querySelector('.status:nth-child(2)').firstChild.style.marginRight = '0.5rem';
}
const hideStatus = () => {
    document.querySelector('.status:nth-child(2)').style.width = '40px';
    document.querySelector('.status:nth-child(2)').firstChild.style.marginRight = '1rem';
}
const showStatusModal = (e) => {
    if(e.target.id = 'status'){
        document.querySelector('#status-modal').parentElement.classList.remove('d-none');
        statusFunctionality();

        //Close modal
        closeModal('status-modal');
    }
}
const showMenuDropdown = (e, id, num) => {
    if(e.target.id === id.slice(1) || document.querySelector(id).contains(e.target)){
        const dropdown = document.querySelectorAll('.nav-dropdown')[num].parentElement;
        dropdown.classList.remove('d-none');
        document.addEventListener('click', (event) => {
            if(event.target.classList.contains('overlay') || event.target.classList.contains('status')){
                dropdown.classList.add('d-none');
            }
        });
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
        if(smiley.contains(e.target) && smiley.children.length !== 0){
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
        if(input.value === '' && document.querySelector('#busy').checked === true){
            input.value = 'I may be slow to respond      ';
            setBtn.classList.remove('set');
            if(suggestions.style.display !== 'none'){
                suggestions.style.display = 'none';
            }
        }else if(input.value === 'I may be slow to respond      '  && document.querySelector('#busy').checked === false){
            input.value = '';
            suggestions.style.display = 'grid';
            setBtn.classList.add('set');
        }
    });

    //Set status
    const status = document.querySelectorAll('.status'),
          icon = status[1].children[0];


    async function mutateStatus(string){
        try{
            const response = await fetch('https://api.github.com/graphql',
            {method: "POST",
            headers: {'Authorization' : `bearer ${process.env.API_KEY}`},
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
            const date = new Date();
            let newDate;
            switch(option){
                case 'Never':
                    newDate = null;
                    break;
                case 'in 30 minutes':
                    newDate = dateFns.addMinutes(date, 30);
                    break;
                case 'in 1 hour':
                    newDate = dateFns.addHours(date, 1);
                    break;
                case 'in 4 hours':
                    newDate = dateFns.addHours(date, 4);
                    break;
                case 'today':
                        newDate = dateFns.endOfDay(date);
                        break;
                case 'this week':
                    newDate = dateFns.endOfWeek(date);
                    break;
                default:
                    newDate = null;
                    break;
            }

            status.forEach((x, i) => {
                const div = document.createElement('div');
                div.classList.add('status-emoji');
                if(smiley.children.length === 1){
                    div.appendChild(document.createTextNode('💭'));
                }else{
                    div.appendChild(document.createTextNode(smiley.textContent));
                }

                x.replaceChild(div, x.children[0]);
                document.querySelectorAll('.status-emoji')[i].nextSibling.remove();
                x.appendChild(document.createTextNode(input.value));
            });

            //Mutate Status
            let expiresAt;
            if(newDate !== null){
                expiresAt = new Date(dateFns.addHours(newDate, 1)).toISOString();
                getToken().then(res => {
                    mutateStatus(`mutation{changeUserStatus(input: {message:"${input.value}", expiresAt: "${expiresAt}"}){ status{message expiresAt}}}`).then(x => {
                        console.log(x);
                    });

                })
                .catch(err => console.log(err));
            }else{
                expiresAt = null;

                getToken().then(res => {
                    mutateStatus(`mutation{changeUserStatus(input: {message:"${input.value}", expiresAt: ${expiresAt}}){ status{message expiresAt}}}`).then(x => {
                        console.log(x);
                    });

                })
                .catch(err => console.log(err));
            }

            //Close Modal
            document.querySelector('#status-modal').parentElement.classList.add('d-none');
        }
    }
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
            const dropdown = document.querySelector('#one.dropdown');
            dropdown.parentElement.classList.remove('d-none');
            dropdown.addEventListener('click', (e) => {
                chooseOption(e, 'clear-status');
                dropdown.parentElement.classList.add('d-none');
            });
            document.addEventListener('click', (e) => {
                if(e.target.classList.contains('overlay')){
                    dropdown.parentElement.classList.add('d-none');
                }
            });
        }
        if(e.target.id === 'visible-status'){
            const dropdown = document.querySelector('#two.dropdown');
            dropdown.parentElement.classList.remove('d-none');
            dropdown.addEventListener('click', (e) => {
                chooseOption(e, 'visible-status');
                if(document.querySelector('.add-on')){
                    document.querySelectorAll('.add-on').forEach(x => {
                        x.remove();
                    });
                }

                if(document.querySelector('#visible-status').firstChild.textContent === 'CDC Unilag'){
                    const p = document.createElement('p');
                    p.textContent = 'Only members of CDC-Unilag will be able to see your status.';
                    p.classList.add('p', 'add-on');
                    document.querySelector('#options').insertAdjacentElement('beforeend', p);
                }
            });

            document.addEventListener('click', (e) => {
                if(e.target.classList.contains('overlay')){
                    dropdown.parentElement.classList.add('d-none');
                }
            });
        }
    }

    function chooseOption(e, id){
        document.querySelector(`#${id}`).childNodes[0].remove();
        document.querySelectorAll('.first-option').forEach(x => {
            if(e.target.classList.contains('first-option') || x.contains(e.target)){
                document.querySelector(`#${id}`).insertBefore(document.createTextNode(x.children[0].textContent), document.querySelector(`#${id}`).children[0]);
            }
        });
        if(document.querySelector('.org').contains(e.target) || e.target.id == 'org-img' || e.target.classList.contains('org')){
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


const main = () =>{
    window.addEventListener('resize', largeScreen);
    if(innerWidth >= 768){
        largeScreen();
    }
    document.querySelector('#header').addEventListener('click', (e) => {
        nav(e);
        showMenuDropdown(e, '#plus', 0);
        showMenuDropdown(e, '#p-pic', 1);
    });

    document.querySelector('#plus').addEventListener('mouseenter', () => {
        headerHover(2, '#d1d5da');
    });
    document.querySelector('#plus').addEventListener('mouseleave', () => {
        headerHover(2, 'white');
    });
    document.querySelector('#p-pic').addEventListener('mouseenter', () => {
        headerHover(3, '#d1d5da');
    });
    document.querySelector('#p-pic').addEventListener('mouseleave', () => {
        headerHover(3, 'white');
    });

    document.addEventListener('click', (e) => {
        showModal(e, 'type', 'type-all');
        showModal(e, 'lang', 'lang-all');
    });


    document.querySelectorAll('.status').forEach(x =>{
        x.addEventListener('click', showStatusModal);
    });
    document.querySelector('#bell').addEventListener('mouseenter', () => {
        document.querySelector('.notification').classList.remove('d-none');
    } );
    document.querySelector('#bell').addEventListener('mouseleave', () => {
        document.querySelector('.notification').classList.add('d-none');
    } );
    document.querySelector('#profile-pic img').addEventListener('mouseenter', () => {
        document.querySelectorAll('.notification')[1].classList.remove('d-none');
    });
    document.querySelector('#profile-pic img').addEventListener('mouseleave', () => {
        document.querySelectorAll('.notification')[1].classList.add('d-none');
    });

    getToken().then(res => {
    getData('{viewer {login avatarUrl name repositories(last:20){totalCount nodes{name updatedAt isPrivate description owner {login} id primaryLanguage{name}}}status{message expiresAt emojiHTML} bio company location websiteUrl twitterUsername followers{totalCount}following{totalCount} starredRepositories{nodes{name viewerHasStarred stargazerCount}}}}')
        .then(response => {
            displayProfile(response);
            displayStatus(response);
            displayRepos(response);
            displayStarredRepos(response);
            //showPage
            document.querySelector('#loader').remove();
            document.querySelector('body').classList.remove('center-loader');
            document.querySelector('.main').classList.remove('d-none');
        })
    })
    .catch(err => console.log(err));
}
main();


/** dropdown position
 */


