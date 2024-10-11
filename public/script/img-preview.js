window.onload = onLoad;
function onLoad() {
let imgPreview= document.getElementById("preview");
let imgName = document.getElementById("imageName");
console.log(imgPreview);
console.log(imgName);
imgName.addEventListener('change', function(event) {
    const file = event.target.files[0]; 
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imgPreview.src = e.target.result; 
        imgPreview.style.display="block";
      };
      reader.readAsDataURL(file); 
    }
  });
}
