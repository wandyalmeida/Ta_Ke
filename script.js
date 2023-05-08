
// JavaScript
document.getElementById("navMenu").addEventListener("click", function() {
    // Toggle active class on menu icon
    this.classList.toggle("active");
    
    // Toggle display property on menu items
    var menuItems = document.getElementById("menuItems");
    if (menuItems.style.display === "inline") {
      menuItems.style.display = "none";
    } else {
      menuItems.style.display = "inline";
      
    }
  });

  // Show the playlist by selection

  function showTab(tabName){
    // hide all tabs
    var tabs = document.getElementsByClassName("myPlaylist");
    for(var i = 0; i < tabs.length; i++){
      tabs[i].style.display = "none";
    }
    // Show selected tab
    document.getElementById(tabName).style.display = "block";
  }

  // show the first tab by default
  showTab("playlist");

  const menuItems = document.querySelectorAll('.menu-Item');

  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove the "selected" class from all menu items
      menuItems.forEach(item => {
        item.classList.remove('selected');
      });
      // Add the "selected" class to the clicked menu item
      item.classList.add('selected');
    });
  });

  
  