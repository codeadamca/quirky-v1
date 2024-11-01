function confirmDelete(id) {
    let confirm = window.confirm("Are you are you want to delete this project? The action cannot be undo.");
    if(confirm)
    {window.location.href=`/admin/project/delete?projId=${id}`;
}
else{ return false;}
}
