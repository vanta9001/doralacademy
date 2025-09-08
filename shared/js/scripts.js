const loginHomePage = document.querySelector(".click-login");
const formLogin = document.querySelector(".login-form-home");
const closeBtnLogin = document.getElementById("close-btn-popup");

loginHomePage.addEventListener("click", () => {
  formLogin.classList.add("active");
});
closeBtnLogin.addEventListener("click", () => {
    formLogin.classList.remove("active");
});

const linkContent= document.querySelector(".main-link-content");
const qlinkHover=document.querySelector(".main-link");
const closeBtnQlink = document.getElementById("qlink-close-btn");
qlinkHover.addEventListener("click", () => {
    linkContent.classList.add("active");
});
closeBtnQlink.addEventListener("click", () =>{
    linkContent.classList.remove("active");    
});

function tabs(selectedtab) {    
    // contents
    var s_tab_content = "tab_content_" + selectedtab;   
    var contents = document.getElementsByTagName("div");
    for(var x=0; x<contents.length; x++) {
        var name = contents[x].getAttribute("name");
        if (name == 'tab_content') {
            if (contents[x].id == s_tab_content) {
            contents[x].style.display = "block";                        
            } else {
            contents[x].style.display = "none";
            }
        }
    }   
    // tabs
    var s_tab = "tab_" + selectedtab;       
    var tabs = document.getElementsByTagName("a");
    for(var x=0; x<tabs.length; x++) {
        name = tabs[x].getAttribute("name");
        if (name == 'tab') {
            if (tabs[x].id == s_tab) {
            tabs[x].className = "active";                       
            } else {
            tabs[x].className = "";
            }
        }
    }
}
const innerPages =document.querySelector(".en-pages-inner-wrapper");
const infoBar =document.getElementById("infobar");
if(infoBar){
innerPages.style.width="100%";
}
const virusLink= document.querySelectorAll("a[href=https://youmatter.suicidepreventionlifeline.org/]")
console.log(virusLink);
{
    document.querySelector(".en-editable-block-wrapper > ul").style.width="80%"
}
