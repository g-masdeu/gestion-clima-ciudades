/**
 * APP.JS - Lògica del Panell Meteorològic Avançat
 * Aquesta aplicació utilitza Firebase Firestore com a backend i OpenWeatherMap API (XML) com a font de dades.
 */
// Inicialització de Firebase llegint de l'objecte global window
if (window.firebaseConfig) {
    firebase.initializeApp(window.firebaseConfig);
} else {
    console.error("No s'ha trobat window.firebaseConfig. Revisa l'ordre dels scripts.");
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Referència a la base de dades Firestore
const ciutatsRef = db.collection("ciutats"); // Referència a la col·lecció de documents

// 2. ESTAT DE L'APLICACIÓ (Variables globals per gestionar la UI)
let totesLesCiutats = []; // Array on guardarem les dades brutes de Firebase
let paginaActual = 1;      // Control de la pàgina de la taula
const elementsPerPagina = 4; // Limitem la vista per no saturar l'API
let filtreText = "";       // Guardem què està buscant l'usuari
let ordreActual = "recent"; // Criteri d'ordenació (recent, asc, desc)

/**
 * 3. FUNCIÓ XML: obtenirClimaXML
 * Recupera dades en format XML, les parseja i retorna un objecte JS net.
 */
async function obtenirClimaXML(ciutat) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciutat}&mode=xml&appid=${window.API_KEY}&units=metric&lang=ca`;
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) return null;
        
        const textXML = await resposta.text();
        const parser = new DOMParser(); // Eina per convertir String a objecte XML
        const xmlDoc = parser.parseFromString(textXML, "text/xml");
        
        // Extracció d'atributs i nodes del document XML
        return {
            nom: xmlDoc.getElementsByTagName("city")[0].getAttribute("name"),
            pais: xmlDoc.getElementsByTagName("country")[0].textContent,
            temp: xmlDoc.getElementsByTagName("temperature")[0].getAttribute("value"),
            sensacio: xmlDoc.getElementsByTagName("feels_like")[0].getAttribute("value"),
            humitat: xmlDoc.getElementsByTagName("humidity")[0].getAttribute("value"),
            nuvols: xmlDoc.getElementsByTagName("clouds")[0].getAttribute("name"),
            icona: xmlDoc.getElementsByTagName("weather")[0].getAttribute("icon"),
            // Manipulació de la cadena de temps (format ISO a HH:MM)
            sortida: xmlDoc.getElementsByTagName("sun")[0].getAttribute("rise").split("T")[1].substring(0,5),
            posta: xmlDoc.getElementsByTagName("sun")[0].getAttribute("set").split("T")[1].substring(0,5),
            hora: xmlDoc.getElementsByTagName("lastupdate")[0].getAttribute("value").split("T")[1].substring(0,5)  
        };
    } catch (e) { 
        console.error("Error API:", e);
        return null; 
    }
}

/**
 * 4. FUNCIÓ DE RENDERITZACIÓ: renderitzarTaula
 * Aquesta funció aplica filtres, ordena, pagina i finalment pinta les files.
 */
async function renderitzarTaula() {
    const cosTaula = document.getElementById("cos-taula");
    cosTaula.innerHTML = "<tr><td colspan='10'>Carregant dades...</td></tr>";

    // A. FILTRATGE: Filtrem l'array segons el buscador
    let dadesFiltrades = totesLesCiutats.filter(c => 
        c.nom.toLowerCase().includes(filtreText.toLowerCase())
    );

    // B. ORDENACIÓ: Apliquem el criteri seleccionat al desplegable
    dadesFiltrades.sort((a, b) => {
        if (ordreActual === "asc") return a.nom.localeCompare(b.nom);
        if (ordreActual === "desc") return b.nom.localeCompare(a.nom);
        return b.creatEl - a.creatEl; // Ordre per data de creació
    });

    // C. PAGINACIÓ: Calculem el subconjunt d'elements a mostrar (0-5, 5-10, etc.)
    const inici = (paginaActual - 1) * elementsPerPagina;
    const final = inici + elementsPerPagina;
    const ciutatsPagina = dadesFiltrades.slice(inici, final);

    // Actualitzem l'indicador de pàgina a la UI
    document.getElementById("page-info").textContent = `Pàgina ${paginaActual} de ${Math.ceil(dadesFiltrades.length / elementsPerPagina) || 1}`;
    
    cosTaula.innerHTML = ""; // Netegem la càrrega

    if (ciutatsPagina.length === 0) {
        cosTaula.innerHTML = "<tr><td colspan='9'>No s'han trobat ciutats.</td></tr>";
        return;
    }

    // D. DIBUIX DE FILES: Per cada ciutat de la pàgina, cridem a l'API XML i creem un <tr>
    for (const c of ciutatsPagina) {
        const d = await obtenirClimaXML(c.nom);
        if (d) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="bold">${d.nom} (${d.pais})</td>
                <td><img src="https://openweathermap.org/img/wn/${d.icona}.png"></td>
                <td class="temp-main">${Math.round(d.temp)}°C</td>
                <td>${Math.round(d.sensacio)}°C</td>
                <td>${d.humitat}%</td>
                <td class="text-small">${d.nuvols}</td>
                <td>${d.sortida}</td>
                <td>${d.posta}</td>
                <td>${d.hora}</td>
                <td><button class="btn-delete" onclick="eliminarCiutat('${c.id}') alt="eliminar">🗑️</button></td>
            `;
            cosTaula.appendChild(row);
        }
    }
}

/**
 * 5. ESCOLTA EN TEMPS REAL (Firebase onSnapshot)
 * S'executa automàticament cada vegada que la base de dades canvia.
 */
ciutatsRef.onSnapshot((snapshot) => {
    totesLesCiutats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderitzarTaula(); // Re-renderitzem la taula amb les noves dades
});

/**
 * 6. GESTIÓ D'ESDEVENIMENTS (Inputs, Sort, Paginació)
 */

// Escolta el cercador i torna a la pàgina 1 per mostrar resultats
document.getElementById("search-input").addEventListener("input", (e) => {
    filtreText = e.target.value;
    paginaActual = 1; 
    renderitzarTaula();
});

// Escolta el selector d'ordre (A-Z, Recent...)
document.getElementById("sort-select").addEventListener("change", (e) => {
    ordreActual = e.target.value;
    renderitzarTaula();
});

// Controls de pàgina anterior i següent
document.getElementById("prev-page").addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        renderitzarTaula();
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    const maxPagines = Math.ceil(totesLesCiutats.filter(c => c.nom.toLowerCase().includes(filtreText.toLowerCase())).length / elementsPerPagina);
    if (paginaActual < maxPagines) {
        paginaActual++;
        renderitzarTaula();
    }
});

/**
 * 7. OPERACIONS CRUD (Crear i Esborrar a Firebase)
 */

// AFEGIR: Envia la nova ciutat a la col·lecció de Firestore
document.getElementById("form-ciutat").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("input-ciutat");
    await ciutatsRef.add({ 
        nom: input.value.trim(), 
        creatEl: Date.now() // Timestamp per a l'ordre de "recents"
    });
    input.value = "";
});

// ELIMINAR: Amb alerta de confirmació i missatge d'èxit
window.eliminarCiutat = (id) => {
    const confirmacio = confirm("Estàs segur que vols eliminar aquesta ciutat de la llista?");
    if (confirmacio) {
        ciutatsRef.doc(id).delete()
            .then(() => alert("Ciutat eliminada amb èxit."))
            .catch((error) => console.error("Error eliminant:", error));
    }
};