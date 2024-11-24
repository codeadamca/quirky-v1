window.onload = function() {
    const confirmDeleteWindow = document.querySelector('.confirmDelete');
    if (confirmDeleteWindow) {
        confirmDeleteWindow.style.display = 'none';  
    }


};


function showConfirmDeleteUser(userId) {
    console.log("run confirmdelete");
    const confirmDeleteWindow = document.querySelector('.confirmDelete');
    console.log(confirmDeleteWindow);
    confirmDeleteWindow.style.display="flex";
    const userIdField = confirmDeleteWindow.querySelector('input[name="userId"]');
    userIdField.value = userId;
}


function showConfirmDeleteProj(projId) {
    console.log("run confirmdelete");
    const confirmDeleteWindow = document.querySelector('.confirmDelete');
    console.log(confirmDeleteWindow);
    confirmDeleteWindow.style.display="flex";
    const projIdField = confirmDeleteWindow.querySelector('input[name="projId"]');
    projIdField.value = projId;
}

function closeConfirmDelete() {
    console.log("run close");
    const confirmDeleteWindow = document.querySelector('.confirmDelete');
    if (confirmDeleteWindow) {
        confirmDeleteWindow.style.display = "none";
    } else {
        console.log("confirmDelete element not found");
    }
}



// function confirmDelete(id) {
//     let confirm = window.confirm("Are you are you want to delete this project? The action cannot be undo.");
//     if(confirm)
//     {window.location.href=`/admin/project/delete?projId=${id}`;
// }
// else{ return false;}
// }

