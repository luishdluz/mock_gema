// Intentar cargar datos de localStorage o usar el Mock inicial
let fuentes = JSON.parse(localStorage.getItem('GEMA_FUENTES')) || [
    {
        id: "SRC-001",
        metadatos: { nombre: "Transacciones SPEI", descripcion: "Histórico de movimientos del sistema de pagos electrónicos." },
        diccionario: [{campo: "ID_TRANS", tipo: "number", desc: "ID único"}]
    },
    {
        id: "SRC-002",
        metadatos: { nombre: "SPEI - Fallidos", descripcion: "Subfuente filtrada para transacciones con error." },
        diccionario: [{campo: "CODIGO_ERROR", tipo: "varchar", desc: "Error técnico"}]
    }
];

$(document).ready(function() {
    renderFuentesSidebar(fuentes);

    // Buscador
    $("#api-search").on("keyup", function() {
        const val = $(this).val().toLowerCase();
        const filtradas = fuentes.filter(f => 
            f.id.toLowerCase().includes(val) || 
            f.metadatos.nombre.toLowerCase().includes(val)
        );
        renderFuentesSidebar(filtradas);
    });
});

function renderFuentesSidebar(lista) {
    const container = $("#api-fuentes-container");
    container.empty();

    lista.forEach(f => {
        const card = `
            <div class="card-fuente-api" onclick="seleccionarFuenteAPI('${f.id}')" id="sidebar-${f.id}">
                <div class="card-header">
                    <span class="card-id">${f.id}</span>
                </div>
                <h3>${f.metadatos.nombre}</h3>
                <p class="card-desc">${f.metadatos.descripcion}</p>
            </div>
        `;
        container.append(card);
    });
}

function seleccionarFuenteAPI(id) {
    const fuente = fuentes.find(f => f.id === id);
    if (!fuente) return;

    // UI: Resaltar selección
    $(".card-fuente-api").removeClass("selected");
    $(`#sidebar-${id}`).addClass("selected");

    // UI: Cambiar de Placeholder a Workspace
    $("#welcome-msg").hide();
    $(".api-workspace").fadeIn();

    // Inyectar Datos en la Doc
    $("#workspace-title").text(fuente.metadatos.nombre);
    $("#doc-id-fuente").text(fuente.id);
    $("#test-id-fuente").val(fuente.id);

   
    // Inyectar Diccionario Detallado
    const dicContainer = $("#api-diccionario-list");
    dicContainer.empty();
    
    if (fuente.diccionario && fuente.diccionario.length > 0) {
        fuente.diccionario.forEach(campo => {
            dicContainer.append(`
                <div class="dic-card-full">
                    <div class="dic-card-header">
                        <strong>${campo.campo}</strong>
                        <span class="tipo-tag">${campo.tipo}</span>
                    </div>
                    <div class="dic-card-body">
                        <p class="dic-desc">${campo.desc || 'Sin descripción.'}</p>
                        <table class="tabla-dic-mini">
                            <tr>
                                <td>Longitud: <strong>${campo.longitud || 'N/A'}</strong></td>
                                <td>Acepta Nulos: <strong>${campo.nulos ? 'Sí' : 'No'}</strong></td>
                            </tr>
                            <tr>
                                <td>Default: <strong>${campo.default || 'Ninguno'}</strong></td>
                                <td>Catálogo: <strong>${campo.catalogo ? 'Sí' : 'No'}</strong></td>
                            </tr>
                        </table>
                        ${campo.catalogo ? `
                            <div class="catalogo-preview">
                                <small>Referencia/Catálogo:</small>
                                <code>${campo.catalogo}</code>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `);
        });
    } else {
        dicContainer.html("<div class='placeholder-api'><p>No hay campos definidos.</p></div>");
    }

    // Resetear Playground
    $("#api-response-viewer").text("Esperando ejecución...").removeClass("error success");
}

function switchApiTab(btn, tabId) {
    $(".api-tab-btn").removeClass("active");
    $(btn).addClass("active");
    
    $(".tab-pane-api").removeClass("active");
    $("#" + tabId).addClass("active");
}

function ejecutarTest() {
    const viewer = $("#api-response-viewer");
    viewer.text("Consultando API Banxico...");

    setTimeout(() => {
        const res = {
            status: "success",
            timestamp: new Date().toISOString(),
            source: $("#test-id-fuente").val(),
            data: [
                { id: 101, valor_muestra: Math.random() * 100 },
                { id: 102, valor_muestra: Math.random() * 100 }
            ]
        };
        viewer.text(JSON.stringify(res, null, 4)).addClass("success");
    }, 800);
}


function generarTokenJWT() {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ 
        sub: "GEMA-USER", 
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        name: "Luis Antonio H."
    }));
    const signature = "MknHZlzvcUa0KKiMPglWXGdb6hflkn49L8cYdx__TbY";
    
    const token = `${header}.${payload}.${signature}`;
    const $input = $("#token-display");
    
    $input.val(token);
    
    // Añadimos el efecto visual de "destello"
    $input.addClass("token-generated-flash");
    setTimeout(() => {
        $input.removeClass("token-generated-flash");
    }, 1000);
}

function consultarInformacionApi() {
    const viewer = $("#api-response-viewer");
    const status = $("#status-pill");
    const token = $("#token-display").val();

    if (!token) {
        alert("Debes generar un token de autenticación primero.");
        return;
    }

    viewer.text("Enviando petición POST a /consultarInformacion...");
    status.hide();

    setTimeout(() => {
        // Simulamos la respuesta basada en los campos del formulario
        const mockRes = {
            success: true,
            status: 200,
            id_peticion: "REQ-" + Math.floor(Math.random() * 1000000),
            fuente: $("#test-id-fuente").val(),
            parametros_recibidos: {
                visibles: $("#test-visibles").val() || "ALL",
                limite: parseInt($("#test-limit").val()) || 10
            },
            data: [
                { id: 1, resultado: "Muestra de dato 1", valor: Math.random() * 5000 },
                { id: 2, resultado: "Muestra de dato 2", valor: Math.random() * 5000 },
                { id: 3, resultado: "Muestra de dato 3", valor: Math.random() * 5000 }
            ]
        };

        viewer.text(JSON.stringify(mockRes, null, 4));
        status.text("200 OK").fadeIn();
        
        // Efecto visual de éxito
        $(".json-container").css("border-color", "#007279");
        setTimeout(() => $(".json-container").css("border-color", "#1e293b"), 1000);
    }, 1200);
}