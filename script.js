let addBtn=document.querySelector(".add-btn");
let removeBtn=document.querySelector(".remove-btn");
let modalCont=document.querySelector(".modal-cont");
let mainCont=document.querySelector(".main-cont");
let textarea=document.querySelector(".textarea-cont")
let allPriorityColors=document.querySelectorAll(".priority-color");
let toolBoxColors=document.querySelectorAll(".color");
let ticketsArr=[];

let colors=["lightpink","lightblue","lightgreen","black"];
let modalPriorityColour=colors[colors.length-1];


let addFlag=false;
let removeFlag=false;

let lockClass="fa-lock";
let unlockClass="fa-lock-open";

if(localStorage.getItem("jira_tickets")){
    //display and retrieve the data
    ticketsArr=JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}

//toolbox-color-grouping 
for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }
        // Display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

    //dbclick moment
    toolBoxColors[i].addEventListener("dblclick", (e) => {
        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

}

//Listener for modal coloring
allPriorityColors.forEach((colorElem,idx)=>{
    colorElem.addEventListener("click",(e)=>{
        allPriorityColors.forEach((priorityColorElem,idx)=>{
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColour=colorElem.classList[0];
    })
})


addBtn.addEventListener("click",(e)=>{
    //display modal
    //Generate ticket

    //addFlag,true-->modal display krna he
    //addFlag,false-->modal hide krn ahe
    addFlag=!addFlag
    if(addFlag){
        modalCont.style.display="flex";
    }
    else{
        modalCont.style.display="none";
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
    console.log(removeFlag);
})


modalCont.addEventListener("keydown",(e)=>{
    let key=e.key;
    console.log(key);
    if(key==="Shift"){
        createTicket(modalPriorityColour,textarea.value)
        // modalCont.style.display="none";
        // textarea.value="";
        addFlag=false;
        setModalToDefault();
    }
})
function createTicket(ticketColor,ticketTask,ticketID){
    let id=ticketID||shortid()
    let ticketCont=document.createElement("div");
    ticketCont.setAttribute("class","ticket-cont");
    ticketCont.innerHTML=`
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">
            <i class="fas fa-lock"></i>
    </div>
    `;
    mainCont.appendChild(ticketCont);
    if(!ticketID) {
        ticketsArr.push({ticketColor,ticketTask,ticketID:id})
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
        
    }
    handleRemoval(ticketCont,id)
    handleLock(ticketCont,id);
    handleColor(ticketCont,id);
}

function handleRemoval(ticket, id) {
    // removeFlag -> true -> remove
    ticket.addEventListener("click", (e) => {
        if (!removeFlag) return;

        let idx = getTicketIdx(id);

        // DB removal
        ticketsArr.splice(idx, 1);
        let strTicketsArr = JSON.stringify(ticketsArr);
        localStorage.setItem("jira_tickets", strTicketsArr);
        
        ticket.remove(); //UI removal
    })
}

function handleLock(ticket,id){
    let ticketLockElem=ticket.querySelector(".ticket-lock");
    let ticketLock=ticketLockElem.children[0];
    let ticketTaskArea=ticket.querySelector(".task-area");
    ticketLock.addEventListener("click",(e)=>{
        
        let ticketIdx = getTicketIdx(id);
        if(ticketLock.classList.contains(lockClass))
        {
            console.log(ticket.classList.contains(lockClass));
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable","true");
        }
        else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable","false");
        }
        
        // Modify data in localStorage (Ticket Task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));

    })
}


function handleColor(ticket,id){
    let ticketColor=ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click",(e)=>{
        //get ticketIdx from ticket arr
        let ticketIdx=getTicketIdx(id)

        let currentTicketColor=ticketColor.classList[1];
        //get ticket color idx
        let currentTicketColorIdx=colors.findIndex((color)=>{
            return currentTicketColor===color;
        })
        currentTicketColorIdx++;
        let newTicketColorIdx=currentTicketColorIdx%colors.length;
        let newTicketColor=colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        //modify data colour in local storage
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}

function getTicketIdx(id){
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return ticketIdx;
}

function setModalToDefault() {
    modalCont.style.display = "none";
    textarea.value = "";
    modalPriorityColour = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[colors.length - 1].classList.add("border");
}