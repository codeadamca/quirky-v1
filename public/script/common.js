async function loadProjects() {
    const response = await fetch('/api/projects');
    const projects = await response.json();
    console.log("Loaded projects:", projects);
    return projects;
}

window.onload = onLoad;

async function onLoad() {
    const projects = await loadProjects();

    // total projects
    const totalNum = Object.keys(projects).length;
    projects.sort((a, b) => new Date(a.date_added) - new Date(b.date_added));

    const btnGetOneWeb = document.querySelector(".btnOne");
    const btnGetAllWebs = document.querySelector(".btnAll");

    const projectWrapper = document.querySelector(".project");
    const randomWebWrapper = document.querySelector(".randomWeb");
    const directory = document.querySelector(".directory");

    btnGetOneWeb.addEventListener("click", function () {
        console.log("clickGetOne");
0
        if(projectWrapper.classList.contains('d-flex'));
        {
            projectWrapper.classList.add('hide');
        }

        randomWebWrapper.classList.remove('hide');
        randomWebWrapper.classList.add('d-flex', 'justify-content-center');

        let randomNum = Math.floor(Math.random() * totalNum);
        console.log(randomNum);

        let existingImg = randomWebWrapper.querySelector('img');
 /*        let existingP = randomWebWrapper.querySelector('p'); */
        let existingA=randomWebWrapper.querySelector('a');

        // get from MongoDB   
        if (existingImg) {
            existingImg.src = "/img/" + projects[randomNum].screen;
            existingImg.alt = projects[randomNum]._id & projects[randomNum].website_name & projects[randomNum].URL;
            existingA.href = projects[randomNum].URL;
            /*             existingP.textContent = projects[randomNum].Github_username + " | "+projects[randomNum].website_name; */           
        }
        else {
            const randomWebImg = document.createElement("img");
            randomWebImg.src = "/img/" + projects[randomNum].screen;
            randomWebImg.classList.add('singleImg','m-5','rounded-2');
            randomWebImg.alt = projects[randomNum]._id & projects[randomNum].website_name & projects[randomNum].URL;
            const randomWebLink = document.createElement("a");
            randomWebLink.href = projects[randomNum].URL;
            randomWebLink.appendChild(randomWebImg);
            randomWebWrapper.appendChild(randomWebLink);
/*             const randomP = document.createElement("p");
            randomP.textContent = projects[randomNum].Github_username + " | " + projects[randomNum].website_name; */
            /* randomWebWrapper.appendChild(randomP); */
        }
    });

    btnGetAllWebs.addEventListener("click", function () {
        randomWebWrapper.classList.remove('d-flex');
        randomWebWrapper.classList.add('hide');
        
        if(btnGetAllWebs.innerHTML==="Show All"){
            projectWrapper.classList.remove('hide');
            projectWrapper.classList.add("display");
            directory.scrollIntoView({ behavior: 'smooth' });
            btnGetAllWebs.innerHTML="Hide All";
        }
                
        else {
            console.log("now it's HIDE ALL");
            /* randomWebWrapper.style.display = "flex"; */
            projectWrapper.classList.remove('display');
            projectWrapper.classList.add('hide');
            btnGetAllWebs.innerHTML="Show All";
            // directory.classList.remove('d-flex', 'flex-row','justify-content-start');
            // directory.classList.add('hide'); 
        }
    });

}



