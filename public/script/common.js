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
    //console.log(projects);

    const btnGetOneWeb = document.querySelector(".btnOne");
    const btnGetAllWebs = document.querySelector(".btnAll");

    // total projects
    const totalNum = Object.keys(projects).length;;
    console.log(totalNum);
    const projectWrapper = document.querySelector(".project");
    const randomWebWrapper = document.querySelector(".randomWeb");
    const directory = document.querySelector(".directory");

    btnGetOneWeb.addEventListener("click", function () {
        console.log("clickGetOne");
        projectWrapper.style.display = "flex";
        let randomNum = Math.floor(Math.random() * totalNum);
        console.log(randomNum);
        let existingImg = randomWebWrapper.querySelector('img');
 /*        let existingP = randomWebWrapper.querySelector('p'); */
        let existingA=randomWebWrapper.querySelector('a');
         if (directory.classList.contains('hide')) {
            directory.classList.remove('d-flex');
        } else {
            directory.classList.add('hide');
        } 
        projectWrapper.style.setProperty('flex', 'none', 'important');
        // get from MongoDB   
        if (existingImg) {
            existingImg.src = "/img/" + projects[randomNum].screen;
            console.log(existingImg.src);
            existingImg.alt = projects[randomNum]._id & projects[randomNum].website_name & projects[randomNum].URL;
            existingA.href = projects[randomNum].URL;
            /*             existingP.textContent = projects[randomNum].Github_username + " | "+projects[randomNum].website_name; */           
        }
        else {
            const randomWebImg = document.createElement("img");
            randomWebImg.src = "/img/" + projects[randomNum].screen;
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
        console.log(projectWrapper);
        //console.log("clickGetAll");
        directory.classList.add('d-flex');
        if (randomWebWrapper.classList.contains('hide')) {
            console.log("hided randomWebWrapper");
        } else {
            randomWebWrapper.classList.add('hide');
        }
        projectWrapper.style.display = "flex";
        let directoryDisplay = window.getComputedStyle(directory).display;
        if (directoryDisplay === "none") {
            //btnGetAllWebs.innerHTML = "Hide";
            directory.style.display = "flex";
            projectWrapper.style.display = "flex";
            projectWrapper.scrollIntoView({ behavior: 'smooth' });
            btnGetAllWebs.innerHTML="Hide All";
        }
        else {
            /* randomWebWrapper.style.display = "flex"; */
            btnGetAllWebs.innerHTML="Show All";
        }
    });
}