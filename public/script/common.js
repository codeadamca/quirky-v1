async function loadProjects() {
    const response = await fetch('/api/projects');
    const projects = await response.json();
    console.log("Loaded projects:", projects);
    return projects;
}
// // {
// //     _id: new ObjectId('66ed95857b5a5965c2e00625'),
// //     website_name: 'useless website3',
// //     Github_username: 'Drashti',
// //     URL: 'http://www.google.com',
// //     GitHub_repo: 'https://github.com/codeadamca/http5114',
// //     screen: 'image3.png',
// //     date_added: 2024-09-22T09:08:00.000Z
// //   }
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

        projectWrapper.style.display = "flex";
        if(directory.classList.contains('d-flex')){
            directory.classList.remove('d-flex', 'flex-row','justify-content-start');
            directory.classList.add('hide');
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
            randomWebImg.classList.add('rounded','m-5');
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
        projectWrapper.style.display = "flex";
        randomWebWrapper.classList.remove('d-flex');
        randomWebWrapper.classList.add('hide');

        let directoryDisplay = window.getComputedStyle(directory).display;
        if (directoryDisplay === "none") {
            btnGetAllWebs.innerHTML = "Hide All";
            directory.classList.remove('hide');
            directory.classList.add('d-flex', 'flex-row','justify-content-start');        
            directory.scrollIntoView({ behavior: 'smooth' });
        }
        else {
            /* randomWebWrapper.style.display = "flex"; */
            btnGetAllWebs.innerHTML="Show All";
            directory.classList.remove('d-flex', 'flex-row','justify-content-start');
            directory.classList.add('hide'); 
        }
    });
}