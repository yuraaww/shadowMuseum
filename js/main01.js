var VisibleMenu = '';
function switchMenu(theMainMenu,theSubMenu,theEvent){
	var SubMenu = document.getElementById(theSubMenu);
	if(SubMenu.style.display == 'none'){
		SubMenu.style.minWidth = theMainMenu.clientWidth;
		SubMenu.style.display = 'block';
		hideMenu();
		VisibleMenu = theSubMenu;
	}
	else{
		if(theEvent!='MouseOver'||VisibleMenu!=theSubMenu!=theSubMenu){
			SubMenu.style.display = 'none';
			VisibleMenu = '';
		}	
	}
}
function hideMenu(){
	if(VisibleMenu!=''){
		document.getElementById(VisibleMenu).style.display = 'none';
	}
	VisibleMenu = '';
}