let esModoCreacion = false; // Flag global

// --- DATOS INICIALES ---
let fuentes = [
    {
        id: "SRC-001",
        idPadre: null, // Desvinculada como pediste
        metadatos: {
            nombre: "Transacciones SPEI",
            descripcion: "Histórico de movimientos del sistema de pagos electrónicos.",
            responsable: "Luis Antonio H.",
            manejador: "SQL Server",
            servidor: "10.20.1.50",
            tabla: "TBL_SPEI_TRANS",
            clasificacion: "Uso Limitado",
            otros: [
                { clave: "Periodicidad", valor: "Diaria" },
                { clave: "Área Dueña", valor: "Sistemas de Pagos" }
            ] 
        },
        diccionario: [
            { campo: "ID_TRANS", tipo: "number", longitud: "10", nulos: false, default: "N/A", desc: "Identificador único", catalogo: "" },
            { campo: "ESTADO_PAGO", tipo: "varchar", longitud: "2", nulos: false, default: "0", desc: "Estado lógico", catalogo: '{"0": "PENDIENTE", "1": "LIQUIDADO"}' }
        ],
        permisosUsuarios: [{ user: "B16847", apps: ["Explorador de datos"] }],
        reglas: { camposVisibles: ["ID_TRANS", "ESTADO_PAGO"], filtrosFijos: [] }
    },
    {
        id: "SRC-002",
        idPadre: null, // Desvinculada como pediste
        metadatos: {
            nombre: "SPEI - Fallidos",
            descripcion: "Subfuente filtrada para transacciones con error.",
            responsable: "Tech Team",
            manejador: "SQL Server",
            servidor: "10.20.1.50",
            tabla: "TBL_SPEI_ERROR",
            clasificacion: "Uso General",
            otros: [{ clave: "Tipo Filtro", valor: "Estado = 2" }]
        },
        diccionario: [
            { campo: "CODIGO_ERROR", tipo: "varchar", longitud: "10", nulos: false, default: "ERR-00", desc: "Código técnico", catalogo: '{"ERR-01": "FONDOS"}' }
        ],
        permisosUsuarios: [],
        reglas: { camposVisibles: ["CODIGO_ERROR"], filtrosFijos: [] }
    },
    {
        id: "TabCalifBanxico",
        idPadre: null,
        metadatos: {
            nombre: "Tablero de Tablero de Calificaciones en el Envío de Información del Sistema Financiero al Banco de México.",
            descripcion: "Indicadores detallados sobre la calidad, oportunidad y consistencia de la información reportada por las instituciones financieras.",
            responsable: "Gerencia de Información del Sistema Financiero",
            manejador: "SQL Server",
            servidor: "DGEFSQLBURO",
            tabla: "indicadores_calidad",
            clasificacion: "Uso Limitado",
            otros: [
                { clave: "Área Propietaria", valor: "DGEF" },
                { clave: "Frecuencia de Actualización", valor: "Mensual" }
            ]
        },
        diccionario: [
            { campo: "Sector", tipo: "varchar", longitud: "100", nulos: false, default: "", desc: "Sector financiero", catalogo: "" },
            { campo: "Institución", tipo: "varchar", longitud: "250", nulos: false, default: "", desc: "Entidad financiera", catalogo: "" },
            { campo: "Formulario", tipo: "varchar", longitud: "100", nulos: false, default: "", desc: "ID de reporte", catalogo: "" },
            { campo: "Periodo", tipo: "number", longitud: "6", nulos: false, default: "0", desc: "YYYYMM", catalogo: "" },
            { campo: "Total", tipo: "varchar", longitud: "50", nulos: true, default: "0", desc: "Monto total", catalogo: "" },
            { campo: "Extemporaneidad", tipo: "varchar", longitud: "2", nulos: true, default: "N", desc: "Indicador fuera de tiempo", catalogo: "" },
            { campo: "Reenvíos", tipo: "varchar", longitud: "50", nulos: true, default: "0", desc: "Cant. de reenvíos", catalogo: "" },
            { campo: "Retransmisiones", tipo: "varchar", longitud: "50", nulos: true, default: "0", desc: "Cant. de retransmisiones", catalogo: "" },
            { campo: "Motivos Retransmisión", tipo: "varchar", longitud: "500", nulos: true, default: "N/A", desc: "Justificación técnica", catalogo: "" },
            { campo: "Oportunidad de aclaraciones", tipo: "varchar", longitud: "500", nulos: true, default: "N/A", desc: "Comentarios de atención", catalogo: "" }
        ],
        permisosUsuarios: [],
        reglas: { 
            camposVisibles: ["Sector", "Institución", "Formulario", "Periodo", "Total", "Extemporaneidad", "Reenvíos", "Retransmisiones", "Motivos Retransmisión", "Oportunidad de aclaraciones"], 
            filtrosFijos: [] 
        }
    },
    {
        id: "TabCalifPublico",
        idPadre: "TabCalifBanxico", // Relacionada al padre anterior
        metadatos: {
            nombre: "Tablero de Calificaciones en el Envío de Información del Sistema Financiero al Banco de México. (Público)",
            descripcion: "Vista pública simplificada y filtrada para transparencia en la calidad de la información financiera recibida por Banxico.",
            responsable: "Gerencia de Información del Sistema Financiero",
            manejador: "SQL Server",
            servidor: "DGEFSQLBURO",
            tabla: "indicadores_calidad",
            clasificacion: "Uso Público",
            otros: [{ clave: "Acceso", valor: "Público General" }]
        },
        diccionario: [
            { campo: "Sector", tipo: "varchar", longitud: "100", nulos: false, default: "", desc: "Sector financiero", catalogo: "" },
            { campo: "Institución", tipo: "varchar", longitud: "250", nulos: false, default: "", desc: "Entidad financiera", catalogo: "" },
            { campo: "Formulario", tipo: "varchar", longitud: "100", nulos: false, default: "", desc: "ID de reporte", catalogo: "" },
            { campo: "Periodo", tipo: "number", longitud: "6", nulos: false, default: "0", desc: "YYYYMM", catalogo: "" },
            { campo: "Total", tipo: "varchar", longitud: "50", nulos: true, default: "0", desc: "Monto total", catalogo: "" },
            { campo: "Extemporaneidad", tipo: "varchar", longitud: "2", nulos: true, default: "N", desc: "Indicador fuera de tiempo", catalogo: "" },
            { campo: "Reenvíos", tipo: "varchar", longitud: "50", nulos: true, default: "0", desc: "Cant. de reenvíos", catalogo: "" },
            { campo: "Retransmisiones", tipo: "varchar", longitud: "50", nulos: true, default: "0", desc: "Cant. de retransmisiones", catalogo: "" },
            { campo: "Motivos Retransmisión", tipo: "varchar", longitud: "500", nulos: true, default: "N/A", desc: "Justificación técnica", catalogo: "" },
            { campo: "Oportunidad de aclaraciones", tipo: "varchar", longitud: "500", nulos: true, default: "N/A", desc: "Comentarios de atención", catalogo: "" }
        ],
        permisosUsuarios: [],
        reglas: { 
            camposVisibles: ["Sector", "Institución", "Formulario", "Periodo", "Total", "Extemporaneidad", "Reenvíos", "Retransmisiones", "Motivos Retransmisión", "Oportunidad de aclaraciones"], 
            filtrosFijos: [
                { campo: "Periodo", operador: ">=", valor: "202301" },
                { campo: "Periodo", operador: "<=", valor: "202412" }
            ] 
        }
    }
];

let fuenteActual = null;
const APPS_SISTEMA = ["Explorador de datos", "Laboratorio de datos", "APIIF"];

$(document).ready(function() {
    renderFuentes(fuentes);
    $("#main-search").on("keyup", function() {
        const val = $(this).val().toLowerCase();
        const filtradas = fuentes.filter(f => 
            f.id.toLowerCase().includes(val) || 
            f.metadatos.nombre.toLowerCase().includes(val) ||
            f.metadatos.descripcion.toLowerCase().includes(val) ||
            f.metadatos.clasificacion.toLowerCase().includes(val)
        );
        renderFuentes(filtradas);
    });
    $("#btn-nueva-fuente").click(function() { abrirAdmin(null); });
    $(".close-modal").click(function() { $(".modal").fadeOut(); });
});

function renderFuentes(data) {
    const container = $("#fuentes-container");
    container.empty();
    data.forEach(f => {
        const card = `
            <div class="card-fuente" data-clase="${f.metadatos.clasificacion}">
                <div class="card-header">
                    <span class="card-id">${f.id}</span>
                    ${f.idPadre ? `<span class="card-id" style="background:#d1ecf1; color:#0c5460;">Hijo de: ${f.idPadre}</span>` : ''}
                </div>
                <h3>${f.metadatos.nombre}</h3>
                <p class="card-desc">${f.metadatos.descripcion}</p>
                <div class="card-actions">
                    <button class="btn-icon" onclick="previewFuente('${f.id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button class="btn-icon" onclick="abrirAdmin('${f.id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg></button>
                    <button class="btn-icon" style="color: #c21832" onclick="eliminarFuente('${f.id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
            </div>`;
        container.append(card);
    });
}

// --- ADMINISTRACIÓN ---
function abrirAdmin(id) {
    esModoCreacion = !id; 

    const fuente = id ? fuentes.find(f => f.id === id) : {
        id: "", idPadre: "",
        metadatos: { nombre: "", descripcion: "", responsable: "", manejador: "SQL Server", servidor: "", tabla: "", clasificacion: "Uso Público", otros: [] },
        diccionario: [], permisosApps: [], permisosUsuarios: [],
        reglas: { camposVisibles: [], filtrosFijos: [] }
    };

    fuenteActual = JSON.parse(JSON.stringify(fuente));
    
    const html = `
        <div class="preview-header">
            <h3>Configuración de Fuente</h3>
            <button class="btn-close-preview" onclick="$('#modal-admin').fadeOut()">&times;</button>
        </div>
        <div class="admin-tabs">
            <button id="tab-btn-metadatos" class="tab-btn active" onclick="showTab(this, 'tab-metadatos')">Metadatos</button>
            <button id="tab-btn-diccionario" class="tab-btn" onclick="showTab(this, 'tab-diccionario')">Diccionario</button>
            <button id="tab-btn-permisos" class="tab-btn" onclick="showTab(this, 'tab-permisos')">Permisos / Seguridad</button>
            <button id="tab-btn-reglas" class="tab-btn" onclick="showTab(this, 'tab-reglas')">Reglas de Exposición</button>
        </div>
        <div class="admin-body">
            <div id="tab-metadatos" class="tab-content">
                ${renderMetadatosUI()}
            </div>
            <div id="tab-diccionario" class="tab-content" style="display:none"></div>
            <div id="tab-permisos" class="tab-content" style="display:none"></div>
            <div id="tab-reglas" class="tab-content" style="display:none"></div>
        </div>
        <div class="admin-footer">
            <button id="btn-guardar-global" class="btn-primary" onclick="guardarCambiosFuentes()" 
                style="padding: 12px 35px; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(0, 114, 121, 0.3); 
                display: ${esModoCreacion ? 'none' : 'block'};">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:8px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Guardar Fuente de Datos
            </button>
        </div>
    `;

    $("#modal-admin .modal-content").html(html);
    $("#modal-admin").fadeIn();
}

function showTab(btn, tabId) {
    $(".tab-btn").removeClass("active");
    $(btn).addClass("active");
    $(".tab-content").hide();
    $("#" + tabId).show();

    if (tabId === 'tab-diccionario') renderDiccionarioUI();
    if (tabId === 'tab-permisos') renderPermisosUI();
    if (tabId === 'tab-reglas') renderReglasUI();
}

function renderMetadatosUI() {
    const m = fuenteActual.metadatos;
    let html = `
        <div class="clasif-banner" id="banner-clasif" style="background: ${getColor(m.clasificacion)}; padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; color:white; margin-bottom:20px;">
            <span style="font-weight:bold;">Clasificación: ${m.clasificacion}</span>
            <select class="form-control" onchange="cambiarClasifAdmin(this)" style="width:200px; background:rgba(255,255,255,0.2); color:white; border:1px solid white;">
                <option value="Uso Limitado" ${m.clasificacion=='Uso Limitado'?'selected':''}>Uso Limitado</option>
                <option value="Uso General" ${m.clasificacion=='Uso General'?'selected':''}>Uso General</option>
                <option value="Uso Público" ${m.clasificacion=='Uso Público'?'selected':''}>Uso Público</option>
                <option value="NO Significativa" ${m.clasificacion=='NO Significativa'?'selected':''}>NO Significativa</option>
            </select>
        </div>
        <div class="metadata-grid">
            <div class="metadata-card"><label class="label-editable">ID Único</label><input type="text" class="form-control-gema" value="${fuenteActual.id}" onkeyup="fuenteActual.id = this.value"></div>
            <div class="metadata-card"><label class="label-editable">ID Fuente Padre</label><input type="text" class="form-control-gema" value="${fuenteActual.idPadre || ''}" onkeyup="fuenteActual.idPadre = this.value"></div>
            ${renderMetaCard("Nombre", m.nombre, "nombre")}
            ${renderMetaCard("Responsable", m.responsable, "responsable")}
            ${renderMetaCard("Manejador", m.manejador, "manejador", ["SQL Server", "Oracle", "Sybase", "MongoDB"])}
            ${renderMetaCard("Servidor", m.servidor, "servidor")}
            ${renderMetaCard("Tabla", m.tabla, "tabla")}
            <div class="metadata-card" style="grid-column: span 2;"><label class="label-editable">Descripción</label><textarea class="form-control-gema" rows="2" onkeyup="updateMetaVal('descripcion', this.value)">${m.descripcion}</textarea></div>
            ${m.otros ? m.otros.map((o, i) => renderMetaCard(o.clave, o.valor, i, null, true)).join('') : ''}
            <div class="metadata-card add-dic-card" style="min-height:80px;" onclick="agregarMetaExtra()"><span>+ Agregar Metadato</span></div>
        </div>`;

    if (esModoCreacion) {
        html += `<div class="wizard-footer" style="text-align:right; margin-top:20px;"><button class="btn-execute" onclick="siguienteTab(1)">Siguiente: Diccionario →</button></div>`;
    }
    return html;
}

function renderDiccionarioUI() {
    const d = fuenteActual.diccionario;
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <div>
                <h4 style="margin:0; color:#204C74;">Gestión de Diccionario</h4>
                <p style="margin:0; font-size:0.8rem; color:#64748b;">Estructura de columnas detectada para la fuente.</p>
            </div>
            <button class="btn-secundario" id="btn-importar-dic" onclick="importarCamposFuente()" style="display:flex; align-items:center; gap:8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Importar campos de fuente
            </button>
        </div>
        <div class="diccionario-grid">
            ${d.map((campo, i) => `
                <div class="metadata-card dic-card">
                    <button class="delete-field" onclick="eliminarCampoDic(${i})">✕</button>
                    <div>
                        <label class="label-editable">Nombre del Campo</label>
                        <input type="text" class="form-control-gema" value="${campo.campo}" onkeyup="updateDicVal(${i}, 'campo', this.value)">
                    </div>
                    <div class="dic-compact-row">
                        <div>
                            <label class="label-editable">Tipo</label>
                            <select class="form-control-gema" onchange="updateDicVal(${i}, 'tipo', this.value)">
                                <option value="varchar" ${campo.tipo=='varchar'?'selected':''}>varchar</option>
                                <option value="number" ${campo.tipo=='number'?'selected':''}>number</option>
                                <option value="date" ${campo.tipo=='date'?'selected':''}>date</option>
                            </select>
                        </div>
                        <div>
                            <label class="label-editable">Long.</label>
                            <input type="text" class="form-control-gema" value="${campo.longitud}" onkeyup="updateDicVal(${i}, 'longitud', this.value)">
                        </div>
                    </div>
                    <div>
                        <label class="label-editable">Descripción</label>
                        <textarea class="form-control-gema" style="height:40px;" onkeyup="updateDicVal(${i}, 'desc', this.value)">${campo.desc || ''}</textarea>
                    </div>
                </div>
            `).join('')}
            <div class="metadata-card add-dic-card" onclick="agregarCampoDic()">
                <div style="font-size: 2.5rem; color: #ccc;">+</div>
                <div style="color: #888; font-weight: bold; font-size: 0.8rem; text-transform: uppercase;">Agregar campo</div>
            </div>
        </div>`;

    if (esModoCreacion) {
        html += `<div class="wizard-footer"><button class="btn-execute" onclick="siguienteTab(2)">Siguiente: Permisos →</button></div>`;
    }
    $("#tab-diccionario").html(html);
}

let usuarioSeleccionado = null;

function renderPermisosUI() {
    if (!fuenteActual.permisosUsuarios) fuenteActual.permisosUsuarios = [];
    let html = `
        <div style="margin-bottom: 15px;">
            <p style="color: #666; font-size: 0.85rem;">Gestión de accesos por usuario y aplicación.</p>
        </div>
        <div class="permisos-v2-container">
            <div class="usuarios-sidebar">
                <div class="sidebar-header">
                    <div style="display:flex; gap:5px;">
                        <input type="text" id="nuevo-usuario-cai" class="form-control-gema" placeholder="Usuario/Grupo" style="font-size:0.8rem;">
                        <button class="btn-primary" onclick="agregarUsuarioPermisos()">+</button>
                    </div>
                </div>
                <div class="usuarios-list" id="lista-usuarios-permisos">
                    ${renderListaUsuarios()}
                </div>
            </div>
            <div class="apps-panel" id="panel-apps-usuario">
                ${renderPanelApps()}
            </div>
        </div>`;

    if (esModoCreacion) {
        html += `<div class="wizard-footer"><button class="btn-execute" onclick="siguienteTab(3)">Siguiente: Exposición →</button></div>`;
    }
    $("#tab-permisos").html(html);
}

function renderListaUsuarios() {
    if (fuenteActual.permisosUsuarios.length === 0) return `<p style="padding:20px; color:#999; font-size:0.8rem; text-align:center;">No hay usuarios.</p>`;
    return fuenteActual.permisosUsuarios.map(u => `
        <div class="usuario-item ${usuarioSeleccionado === u.user ? 'active' : ''}" onclick="seleccionarUsuario('${u.user}')">
            <span>${u.user}</span>
            <button class="delete-field" style="position:static; font-size:12px;" onclick="event.stopPropagation(); eliminarUsuarioPermisos('${u.user}')">✕</button>
        </div>
    `).join('');
}

function renderPanelApps() {
    if (!usuarioSeleccionado) {
        return `<div class="placeholder-api" style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8;"><p>Selecciona un usuario.</p></div>`;
    }

    const userData = fuenteActual.permisosUsuarios.find(u => u.user === usuarioSeleccionado);

    // VALIDACIÓN DE SEGURIDAD: Si el usuario ya no existe en la lista, limpiamos la selección
    if (!userData) {
        usuarioSeleccionado = null;
        return `<div class="placeholder-api" style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8;"><p>Selecciona un usuario.</p></div>`;
    }

    const userApps = userData.apps || [];
    return `
        <h4 style="color:#204C74; margin:0;">Accesos: <span style="color:#007279;">${usuarioSeleccionado}</span></h4>
        <div class="apps-grid-permisos">
            ${APPS_SISTEMA.map(app => {
                const isEnabled = userApps.includes(app);
                return `
                    <div class="app-toggle-card ${isEnabled ? 'enabled' : ''}">
                        <span style="font-size:0.9rem; font-weight:600;">${app}</span>
                        <label class="switch">
                            <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="toggleAppUsuario('${app}')">
                            <span class="slider"></span>
                        </label>
                    </div>`;
            }).join('')}
        </div>`;
}

function renderMetaCard(label, value, key, options = null, isExtra = false) {
    let input = "";
    if (options) {
        input = `<select class="form-control-gema" onchange="updateMetaVal('${key}', this.value)">${options.map(o => `<option ${o==value?'selected':''}>${o}</option>`).join('')}</select>`;
    } else {
        const action = isExtra ? `updateMetaExtra(${key}, this.value)` : `updateMetaVal('${key}', this.value)`;
        input = `<input type="text" class="form-control-gema" value="${value}" onkeyup="${action}">`;
    }
    return `
        <div class="metadata-card">
            ${isExtra ? `<button class="delete-field" onclick="eliminarMetaExtra(${key})">✕</button>` : ''}
            <input type="text" class="label-editable" value="${label}" ${isExtra ? `onkeyup="updateMetaExtraLabel(${key}, this.value)"` : 'readonly'} style="border:none; background:none; font-weight:bold; color:var(--primary-gema); outline:none; width:100%; cursor:${isExtra ? 'text' : 'default'};">
            ${input}
        </div>`;
}

function updateMetaVal(k, v) { fuenteActual.metadatos[k] = v; }
function updateMetaExtraLabel(i, v) { fuenteActual.metadatos.otros[i].clave = v; }
function updateMetaExtra(i, v) { fuenteActual.metadatos.otros[i].valor = v; }
function agregarMetaExtra() {
    if (!fuenteActual.metadatos.otros) fuenteActual.metadatos.otros = [];
    fuenteActual.metadatos.otros.push({ clave: "Nuevo Metadato", valor: "" });
    $("#tab-metadatos").html(renderMetadatosUI());
}
function eliminarMetaExtra(i) {
    if (confirm("¿Eliminar?")) {
        fuenteActual.metadatos.otros.splice(i, 1);
        $("#tab-metadatos").html(renderMetadatosUI());
    }
}
function updateDicVal(i, k, v) { fuenteActual.diccionario[i][k] = v; }
function agregarCampoDic() { fuenteActual.diccionario.push({ campo: "NUEVO", tipo: "varchar", longitud: "50", nulos: true, default: "", desc: "", catalogo: "" }); renderDiccionarioUI(); }
function eliminarCampoDic(i) { fuenteActual.diccionario.splice(i, 1); renderDiccionarioUI(); }
function cambiarClasifAdmin(sel) { 
    const v = $(sel).val(); 
    fuenteActual.metadatos.clasificacion = v; 
    $("#banner-clasif").css("background", getColor(v));
    $("#banner-clasif span").text("Clasificación: " + v);
}

function guardarCambiosFuentes() {
    if (!fuenteActual.id.trim()) { alert("ID requerido."); return; }
    if (!fuenteActual.metadatos.nombre.trim()) { alert("Nombre requerido."); return; }

    const indexExistente = fuentes.findIndex(f => f.id === fuenteActual.id);
    if (indexExistente !== -1) {
        fuentes[indexExistente] = JSON.parse(JSON.stringify(fuenteActual));
    } else {
        fuentes.push(JSON.parse(JSON.stringify(fuenteActual)));
    }

    localStorage.setItem('GEMA_FUENTES', JSON.stringify(fuentes));
    renderFuentes(fuentes);
    $("#modal-admin").fadeOut(300, function() { fuenteActual = null; });
}

function previewFuente(id) {
    const fuente = fuentes.find(f => f.id === id);
    if (!fuente) return;
    
    const esFuenteDeErrores = fuente.metadatos.nombre.toLowerCase().includes("fallidos");
    
    const htmlContent = `
        <div class="preview-header">
            <h3>Muestra de Datos: ${fuente.metadatos.nombre}</h3>
            <button class="btn-close-preview" onclick="cerrarModalPreview()">&times;</button>
        </div>
        <div class="table-responsive-container">
            <table class="gema-table">
                <thead>
                    <tr>${fuente.diccionario.map(d => `<th>${d.campo}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${generarFilasMockPro(esFuenteDeErrores, fuente)}
                </tbody>
            </table>
        </div>`;
        
    $("#modal-preview .modal-content").html(htmlContent);
    $("#modal-preview").fadeIn(300);
}

function generarFilasMockPro(soloFallidos, fuente) {
    let rows = "";
    const cantFilas = 8; // Número de filas a mostrar en el preview

    for (let i = 0; i < cantFilas; i++) {
        rows += "<tr>";
        fuente.diccionario.forEach(col => {
            let val = "";
            
            // --- LÓGICA POR TIPO DE FUENTE (ID) ---
            
            // 1. Datos para Tableros de Calificaciones
            if (fuente.id.includes("TabCalif")) {
                const sectores = ["Banca Múltiple", "Banca de Desarrollo", "Casas de Bolsa", "SOFIPO"];
                const bancos = ["BBVA", "SANTANDER", "BANAMEX", "BANORTE", "HSBC", "SCOTIABANK"];
                const formularios = ["RC01", "F12", "CP04", "R01", "R24"];
                const motivos = ["Cifras descuadradas", "Error en catálogo", "Actualización de saldo", "N/A"];
                
                switch(col.campo) {
                    case "Sector": val = sectores[Math.floor(Math.random() * sectores.length)]; break;
                    case "Institución": val = bancos[Math.floor(Math.random() * bancos.length)]; break;
                    case "Formulario": val = formularios[Math.floor(Math.random() * formularios.length)]; break;
                    case "Periodo": val = 202400 + (i + 1); break;
                    case "Total": val = (Math.random() * 50000).toLocaleString('en-US', {minimumFractionDigits:2}); break;
                    case "Extemporaneidad": val = Math.random() > 0.8 ? "S" : "N"; break;
                    case "Reenvíos": val = Math.floor(Math.random() * 3); break;
                    case "Retransmisiones": val = Math.floor(Math.random() * 2); break;
                    case "Motivos Retransmisión": val = motivos[Math.floor(Math.random() * motivos.length)]; break;
                    case "Oportunidad de aclaraciones": val = "Dentro de tiempo"; break;
                    default: val = "---";
                }
            }
            
            // 2. Datos para Transacciones SPEI (SRC-001)
            else if (fuente.id === "SRC-001") {
                if (col.campo === "ID_TRANS") val = 4589223100 + i;
                if (col.campo === "ESTADO_PAGO") val = Math.random() > 0.5 ? "1 (LIQUIDADO)" : "0 (PENDIENTE)";
            }
            
            // 3. Datos para SPEI Fallidos (SRC-002)
            else if (fuente.id === "SRC-002") {
                const errores = ["ERR-01 (FONDOS)", "ERR-05 (TIMEOUT)", "ERR-09 (BANCO_DEST)", "ERR-12 (CTA_INV)"];
                if (col.campo === "CODIGO_ERROR") val = errores[Math.floor(Math.random() * errores.length)];
            }
            
            // --- LÓGICA GENÉRICA POR TIPO (En caso de nuevas fuentes) ---
            else {
                if (col.tipo === "number") val = Math.floor(Math.random() * 1000);
                else if (col.tipo === "date") val = "2024-04-28";
                else val = "Dato_Mock_" + i;
            }

            rows += `<td>${val}</td>`;
        });
        rows += "</tr>";
    }
    return rows;
}

function cerrarModalPreview() { $("#modal-preview").fadeOut(); }
function eliminarFuente(id) { if(confirm("¿Eliminar?")) { fuentes = fuentes.filter(f => f.id !== id); renderFuentes(fuentes); } }
function getColor(c) { const cs = { "Uso Limitado": "#c21832", "Uso General": "#f08019", "Uso Público": "#44ac34", "NO Significativa": "#5a5959" }; return cs[c] || "#5a5959"; }

function renderReglasUI() {
    if (!fuenteActual.reglas) fuenteActual.reglas = { camposVisibles: [], filtrosFijos: [] };
    const todosLosCampos = fuenteActual.diccionario.map(d => d.campo);
    const visibles = fuenteActual.reglas.camposVisibles || [];
    const noVisibles = todosLosCampos.filter(c => !visibles.includes(c));
    const filtros = fuenteActual.reglas.filtrosFijos || [];

    let html = `
        <div style="margin-bottom: 30px;">
            <h4 style="color:#204C74;">1. Visibilidad de Campos</h4>
            <div class="duallist-container">
                <div class="duallist-column">
                    <div class="duallist-header">Disponibles</div>
                    <div class="duallist-list">${noVisibles.map(c => renderItemDual(c)).join('')}</div>
                </div>
                <div class="duallist-controls">
                    <button class="btn-dual-move" onclick="moverTodosCampos(true)"> >> </button>
                    <button class="btn-dual-move" onclick="moverTodosCampos(false)"> << </button>
                </div>
                <div class="duallist-column" style="border-color: #007279;">
                    <div class="duallist-header">Visibles</div>
                    <div class="duallist-list">${visibles.map(c => renderItemDual(c)).join('')}</div>
                </div>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <h4 style="color:#204C74;">2. Filtros Fijos</h4>
            <div class="filtros-reglas-container">
                <table class="gema-table-filtros">
                    <thead><tr><th>Campo</th><th>Operador</th><th>Valor</th><th></th></tr></thead>
                    <tbody>
                        ${filtros.map((f, i) => `
                            <tr>
                                <td><select class="form-control-gema" onchange="updateFiltroRegla(${i}, 'campo', this.value)"><option value="">...</option>${todosLosCampos.map(c => `<option value="${c}" ${f.campo === c ? 'selected' : ''}>${c}</option>`).join('')}</select></td>
                                <td><select class="form-control-gema" onchange="updateFiltroRegla(${i}, 'operador', this.value)"><option value="=" ${f.operador === '=' ? 'selected' : ''}>=</option><option value=">=" ${f.operador === '>=' ? 'selected' : ''}>>=</option><option value="<=" ${f.operador === '<=' ? 'selected' : ''}><=</option></select></td>
                                <td><input type="text" class="form-control-gema" value="${f.valor}" onkeyup="updateFiltroRegla(${i}, 'valor', this.value)"></td>
                                <td><button class="delete-field" style="position:static;" onclick="eliminarFiltroRegla(${i})">✕</button></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
                <button class="btn-secundario" onclick="agregarFiltroRegla()" style="margin-top:10px; width:100%; border-style:dashed;">+ Añadir regla</button>
            </div>
        </div>`;

    if (esModoCreacion) {
        const tieneCampos = visibles.length > 0;
        html += `<div class="wizard-footer" style="margin-top:30px; border-top: 2px solid #eee; padding-top:20px;">
                ${tieneCampos ? `<button class="btn-importar-magic" style="width:100%; justify-content:center;" onclick="guardarCambiosFuentes()">FINALIZAR Y GUARDAR</button>` : `<div class="alert-info-gema">⚠️ Selecciona al menos un campo visible.</div>`}
            </div>`;
    }
    $("#tab-reglas").html(html);
}

function agregarUsuarioPermisos() {
    const val = $("#nuevo-usuario-cai").val().trim().toUpperCase();
    if (val) {
        if (!fuenteActual.permisosUsuarios.find(u => u.user === val)) {
            fuenteActual.permisosUsuarios.push({ user: val, apps: [] });
            usuarioSeleccionado = val;
            renderPermisosUI();
        }
    }
}
function seleccionarUsuario(user) { usuarioSeleccionado = user; renderPermisosUI(); }
function eliminarUsuarioPermisos(user) { fuenteActual.permisosUsuarios = fuenteActual.permisosUsuarios.filter(u => u.user !== user); if (usuarioSeleccionado === user) usuarioSeleccionado = null; renderPermisosUI(); }
function toggleAppUsuario(app) {
    const uIdx = fuenteActual.permisosUsuarios.findIndex(u => u.user === usuarioSeleccionado);
    if (uIdx !== -1) {
        const apps = fuenteActual.permisosUsuarios[uIdx].apps || [];
        const aIdx = apps.indexOf(app);
        if (aIdx > -1) apps.splice(aIdx, 1); else apps.push(app);
        fuenteActual.permisosUsuarios[uIdx].apps = apps;
        renderPermisosUI();
    }
}

function importarCamposFuente() {
    const btn = $("#btn-importar-dic");
    const original = btn.html();
    btn.prop("disabled", true).text("Importando...");
    setTimeout(() => {
        fuenteActual.diccionario = [
            { campo: "Sector", tipo: "varchar", longitud: "100", nulos: false, default: "", desc: "", catalogo: "" },
            { campo: "Institución", tipo: "varchar", longitud: "250", nulos: false, default: "", desc: "", catalogo: "" },
            { campo: "Formulario", tipo: "varchar", longitud: "100", nulos: false, default: "", desc: "", catalogo: "" },
            { campo: "Periodo", tipo: "number", longitud: "6", nulos: false, default: "0", desc: "", catalogo: "" }
        ];
        btn.prop("disabled", false).html(original);
        renderDiccionarioUI();
    }, 1500);
}

function toggleVisibilidadCampo(nombre) {
    if (!fuenteActual.reglas.camposVisibles) fuenteActual.reglas.camposVisibles = [];
    const idx = fuenteActual.reglas.camposVisibles.indexOf(nombre);
    if (idx > -1) fuenteActual.reglas.camposVisibles.splice(idx, 1);
    else fuenteActual.reglas.camposVisibles.push(nombre);
    renderReglasUI();
}
function moverTodosCampos(aVisible) {
    fuenteActual.reglas.camposVisibles = aVisible ? fuenteActual.diccionario.map(d => d.campo) : [];
    renderReglasUI();
}
function agregarFiltroRegla() {
    if (!fuenteActual.reglas.filtrosFijos) fuenteActual.reglas.filtrosFijos = [];
    fuenteActual.reglas.filtrosFijos.push({ campo: "", operador: "=", valor: "" });
    renderReglasUI();
}
function updateFiltroRegla(i, p, v) { fuenteActual.reglas.filtrosFijos[i][p] = v; }
function eliminarFiltroRegla(i) { fuenteActual.reglas.filtrosFijos.splice(i, 1); renderReglasUI(); }
function renderItemDual(n) {
    const c = fuenteActual.diccionario.find(d => d.campo === n);
    return `<div class="duallist-item" onclick="toggleVisibilidadCampo('${n}')"><strong>${n}</strong> <span class="tipo">${c ? c.tipo : 'N/A'}</span></div>`;
}
function siguienteTab(i) {
    const tabs = ["tab-btn-metadatos", "tab-btn-diccionario", "tab-btn-permisos", "tab-btn-reglas"];
    $(`#${tabs[i]}`).trigger('click');
}