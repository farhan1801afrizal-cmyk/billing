const totalPS = 4;
const psData = {};
const grid = document.getElementById("psGrid");
const historyBox = document.getElementById("history");

/* GENERATE */
for (let i=1;i<=totalPS;i++){
    psData[i]={time:0,running:false,interval:null,mode:"hourly"};

    grid.innerHTML+=`
    <div class="card" id="card${i}">
        <h3>🎮 PS ${i}</h3>

        <select id="mode${i}" onchange="updateTotal(${i})">
            <option value="hourly">Per Jam</option>
            <option value="unlimited">Unlimited</option>
            ${Array.from({length:12},(_,j)=>`<option value="package${j+1}">Paket ${j+1} Jam</option>`).join("")}
        </select>

        <input type="number" id="price${i}" value="5000">
        <input type="number" id="discount${i}" placeholder="Diskon %">

        <div class="timer paused" id="timer${i}">00:00:00</div>
        <div class="realtime" id="realtime${i}">Rp 0</div>

        <div class="buttons">
            <button class="start" onclick="startPS(${i})">▶</button>
            <button class="pause" onclick="pausePS(${i})">⏸</button>
            <button class="stop" onclick="stopPS(${i})">■</button>
        </div>
    </div>`;
}

/* CLOCK */
setInterval(()=>realClock.innerText=new Date().toLocaleTimeString(),1000);

/* START */
function startPS(i){
    if(psData[i].running)return;
    const mode=document.getElementById(`mode${i}`).value;
    psData[i].mode=mode;
    if(mode.startsWith("package")) psData[i].time=Number(mode.replace("package",""))*3600;
    psData[i].running=true;

    psData[i].interval=setInterval(()=>{
        if(mode.startsWith("package")){
            psData[i].time--;
            if(psData[i].time===300) alert(`⚠️ PS ${i} sisa 5 menit`);
            if(psData[i].time<=0) return stopPS(i);
        } else psData[i].time++;

        updateUI(i);
    },1000);
}

/* PAUSE */
function pausePS(i){
    clearInterval(psData[i].interval);
    psData[i].running=false;
    updateUI(i);
}

/* STOP */
function stopPS(i){
    clearInterval(psData[i].interval);
    psData[i].running=false;

    const price=+priceEl(i).value;
    const discount=+discountEl(i).value||0;
    let total=calcTotal(i,price);
    total-=total*(discount/100);

    saveHistory(`PS ${i}`,total);
    showReceipt(i,total);

    psData[i].time=0;
    updateUI(i);
}

/* HELPERS */
const priceEl=i=>document.getElementById(`price${i}`);
const discountEl=i=>document.getElementById(`discount${i}`);

function calcTotal(i,price){
    if(psData[i].mode==="hourly") return psData[i].time/3600*price;
    if(psData[i].mode.startsWith("package")) return price*Number(psData[i].mode.replace("package",""));
    return price;
}

function updateUI(i){
    timerEl(i).innerText=format(psData[i].time);
    timerEl(i).className="timer "+(psData[i].running?"running":"paused");
    card(i).classList.toggle("running-card",psData[i].running);
    updateTotal(i);
}

const timerEl=i=>document.getElementById(`timer${i}`);
const card=i=>document.getElementById(`card${i}`);

function format(s){
    return `${String(s/3600|0).padStart(2,"0")}:${String(s%3600/60|0).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}

function updateTotal(i){
    let total=calcTotal(i,+priceEl(i).value);
    document.getElementById(`realtime${i}`).innerText=`Rp ${Math.ceil(total).toLocaleString()}`;
}

/* HISTORY */
function saveHistory(ps,total){
    const h=JSON.parse(localStorage.getItem("psHistory")||"[]");
    h.unshift(`${new Date().toLocaleTimeString()} | ${ps} | Rp ${Math.ceil(total).toLocaleString()}`);
    localStorage.setItem("psHistory",JSON.stringify(h));
    historyBox.innerHTML=h.map(x=>`<p>${x}</p>`).join("");
}

/* RECEIPT */
function showReceipt(ps,total){
    const r=document.getElementById("receipt");
    r.innerHTML=`
    <div class="receipt-content">
        <h3>Struk Billing</h3>
        <p>${ps}</p>
        <p>Total: Rp ${Math.ceil(total).toLocaleString()}</p>
        <button onclick="this.parentElement.parentElement.classList.add('hidden')">Tutup</button>
    </div>`;
    r.classList.remove("hidden");
}
