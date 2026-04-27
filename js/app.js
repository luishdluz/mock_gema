// --- DATOS INICIALES ---
let fuentes = [
    {
        id: "SRC-001",
        idPadre: null,
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
        permisosApps: ["Explorador de datos", "APIIF"],
        permisosUsuarios: [{ app: "Explorador de datos", user: "B16847" }]
    },
    {
        id: "SRC-002",
        idPadre: "SRC-001",
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
        permisosApps: ["Laboratorio de datos"],
        permisosUsuarios: []
    }
];

let fuenteActual = null;
const APPS_SISTEMA = ["Explorador de datos", "Laboratorio de datos", "PIIF", "APIIF"];

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
    const fuente = id ? fuentes.find(f => f.id === id) : {
        id: "", idPadre: "",
        metadatos: { nombre: "", descripcion: "", responsable: "", manejador: "SQL Server", servidor: "", tabla: "", clasificacion: "Uso Público", otros: [] },
        diccionario: [], permisosApps: [], permisosUsuarios: []
    };

    fuenteActual = JSON.parse(JSON.stringify(fuente));
    
    const html = `
        <div class="preview-header">
            <h3>Configuración de Fuente</h3>
            <button class="btn-close-preview" onclick="$('#modal-admin').fadeOut()">&times;</button>
        </div>
        <div class="admin-tabs">
            <button class="tab-btn active" onclick="showTab(this, 'tab-metadatos')">Metadatos</button>
            <button class="tab-btn" onclick="showTab(this, 'tab-diccionario')">Diccionario</button>
            <button class="tab-btn" onclick="showTab(this, 'tab-permisos')">Permisos / Seguridad</button>
            <button class="tab-btn" onclick="showTab(this, 'tab-reglas')">Reglas de Exposición</button>
        </div>
        <div class="admin-body">
            <div id="tab-metadatos" class="tab-content">
                ${renderMetadatosUI()}
            </div>
            <div id="tab-diccionario" class="tab-content" style="display:none"></div>
            <div id="tab-permisos" class="tab-content" style="display:none"></div>
            <div id="tab-reglas" class="tab-content" style="display:none">
                <p style="padding:20px;">Próximamente: Configuración de filtros y exposición de API.</p>
            </div>
        </div>
        <div class="admin-footer">
            <button class="btn-primary" onclick="guardarCambiosFuentes()" style="padding: 12px 35px; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(0, 114, 121, 0.3);">
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

    // Renderizado bajo demanda
    if (tabId === 'tab-diccionario') renderDiccionarioUI();
    if (tabId === 'tab-permisos') renderPermisosUI();
    if (tabId === 'tab-reglas') renderReglasUI();
}

// --- RENDERIZADO DE SECCIONES ---

function renderMetadatosUI() {
    const m = fuenteActual.metadatos;
    return `
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
}

function renderDiccionarioUI() {
    const d = fuenteActual.diccionario;
    let html = `<div class="diccionario-grid">
        ${d.map((campo, i) => `
            <div class="metadata-card dic-card">
                <button class="delete-field" onclick="eliminarCampoDic(${i})">✕</button>
                <div><label class="label-editable">Campo</label><input type="text" class="form-control-gema" value="${campo.campo}" onkeyup="updateDicVal(${i}, 'campo', this.value)"></div>
                <div class="dic-compact-row">
                    <div><label class="label-editable">Tipo</label><select class="form-control-gema" onchange="updateDicVal(${i}, 'tipo', this.value)"><option value="varchar" ${campo.tipo=='varchar'?'selected':''}>varchar</option><option value="number" ${campo.tipo=='number'?'selected':''}>number</option><option value="date" ${campo.tipo=='date'?'selected':''}>date</option></select></div>
                    <div><label class="label-editable">Long.</label><input type="text" class="form-control-gema" value="${campo.longitud}" onkeyup="updateDicVal(${i}, 'longitud', this.value)"></div>
                </div>
                <div class="dic-compact-row">
                    <div><label class="label-editable">Default</label><input type="text" class="form-control-gema" value="${campo.default}" onkeyup="updateDicVal(${i}, 'default', this.value)"></div>
                    <div class="dic-row-check" style="margin-top:15px"><input type="checkbox" ${campo.nulos ? 'checked' : ''} onchange="updateDicVal(${i}, 'nulos', this.checked)"><label>NULL</label></div>
                </div>
                <div><label class="label-editable">Descripción</label><textarea class="form-control-gema" style="height:40px;" onkeyup="updateDicVal(${i}, 'desc', this.value)">${campo.desc}</textarea></div>
                <div><label class="label-editable">Catálogo JSON</label><textarea class="form-control-gema catalogo-area" style="height:50px;" onkeyup="updateDicVal(${i}, 'catalogo', this.value)">${campo.catalogo}</textarea></div>
            </div>`).join('')}
        <div class="metadata-card add-dic-card" onclick="agregarCampoDic()"><div>+</div><div>Agregar campo</div></div>
    </div>`;
    $("#tab-diccionario").html(html);
}

function renderPermisosUI() {
    if (!fuenteActual.permisosApps) fuenteActual.permisosApps = [];
    if (!fuenteActual.permisosUsuarios) fuenteActual.permisosUsuarios = [];

    let html = `
        <div style="margin-bottom: 20px;">
            <p style="color: #666; font-size: 0.9rem;">
                Administra qué aplicaciones tienen acceso a esta fuente y qué usuarios específicos dentro de ellas.
            </p>
        </div>
        <div class="permisos-container">
            ${APPS_SISTEMA.map(app => {
                const isActive = fuenteActual.permisosApps.includes(app);
                const usuariosApp = fuenteActual.permisosUsuarios.filter(u => u.app === app);
                
                // Creamos un ID seguro (sin espacios) para el input
                const safeId = app.replace(/\s+/g, '_');

                return `
                <div class="app-card ${isActive ? '' : 'inactive'}">
                    <div class="app-card-header">
                        <span style="font-weight:bold; color:var(--accent-blue);">${app}</span>
                        <label class="switch">
                            <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleAppAcceso('${app}')">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="app-card-body">
                        ${isActive ? `
                            <label class="label-editable">Autorizar Usuario / Grupo CAI</label>
                            <div style="display:flex; gap:8px; margin-bottom:10px;">
                                <input type="text" id="input_user_${safeId}" 
                                    class="form-control-gema" style="flex:1;" 
                                    placeholder="Ej: B16847"
                                    onkeypress="if(event.key==='Enter') agregarUsuarioApp('${app}', '${safeId}')">
                                <button class="btn-primary" style="padding:0 15px;" 
                                    onclick="agregarUsuarioApp('${app}', '${safeId}')">+</button>
                            </div>
                            <div class="user-chips-container">
                                ${usuariosApp.map(u => `
                                    <div class="user-chip">
                                        ${u.user}
                                        <span class="remove-user" onclick="removerUsuarioApp('${app}', '${u.user}')">&times;</span>
                                    </div>
                                `).join('')}
                                ${usuariosApp.length === 0 ? 
                                    '<span style="color:#999; font-size:0.75rem; font-style:italic;">Acceso total para todos los usuarios de esta app.</span>' 
                                    : ''}
                            </div>
                        ` : `
                            <p style="color:#999; font-size:0.85rem; text-align:center; margin:15px 0;">
                                Aplicación sin acceso.
                            </p>
                        `}
                    </div>
                </div>`;
            }).join('')}
        </div>`;

    $("#tab-permisos").html(html);
}

// --- FUNCIONES AUXILIARES ---

function renderMetaCard(label, value, key, options = null, isExtra = false) {
    let input = "";
    
    // Generar el campo de VALOR (Select o Input)
    if (options) {
        input = `
            <select class="form-control-gema" onchange="updateMetaVal('${key}', this.value)">
                ${options.map(o => `<option ${o==value?'selected':''}>${o}</option>`).join('')}
            </select>`;
    } else {
        const action = isExtra ? `updateMetaExtra(${key}, this.value)` : `updateMetaVal('${key}', this.value)`;
        input = `<input type="text" class="form-control-gema" value="${value}" onkeyup="${action}">`;
    }

    // Retornar la Card. Si es extra (personalizado), el nombre (label) es un input editable.
    return `
        <div class="metadata-card">
            ${isExtra ? `<button class="delete-field" onclick="eliminarMetaExtra(${key})">✕</button>` : ''}
            <input type="text" class="label-editable" 
                value="${label}" 
                ${isExtra ? `onkeyup="updateMetaExtraLabel(${key}, this.value)"` : 'readonly'} 
                title="${isExtra ? 'Haz clic para editar el nombre' : ''}"
                style="border:none; background:none; font-weight:bold; color:var(--primary-gema); outline:none; width:100%; cursor:${isExtra ? 'text' : 'default'};">
            ${input}
        </div>
    `;
}

function toggleAppAcceso(appName) {
    const idx = fuenteActual.permisosApps.indexOf(appName);
    if (idx > -1) {
        fuenteActual.permisosApps.splice(idx, 1);
        // Al quitar la app, limpiamos sus usuarios por seguridad
        fuenteActual.permisosUsuarios = fuenteActual.permisosUsuarios.filter(u => u.app !== appName);
    } else {
        fuenteActual.permisosApps.push(appName);
    }
    renderPermisosUI();
}

function agregarUsuarioApp(appName, safeId) {
    const input = $(`#input_user_${safeId}`);
    const val = input.val().trim().toUpperCase();
    
    if (val) {
        // Evitar duplicados en la misma app
        const existe = fuenteActual.permisosUsuarios.find(u => u.app === appName && u.user === val);
        
        if (!existe) {
            fuenteActual.permisosUsuarios.push({ app: appName, user: val });
            renderPermisosUI(); // Refrescar la vista
        } else {
            alert("El usuario o grupo ya existe en esta aplicación.");
        }
        
        input.val(""); // Limpiar input
        input.focus();
    }
}

function removerUsuarioApp(appName, userName) {
    fuenteActual.permisosUsuarios = fuenteActual.permisosUsuarios.filter(u => !(u.app === appName && u.user === userName));
    renderPermisosUI();
}

function updateMetaVal(k, v) { 
    fuenteActual.metadatos[k] = v; 
}
function updateMetaExtraLabel(i, v) {
    fuenteActual.metadatos.otros[i].clave = v;
}
function updateMetaExtra(i, v) {
    fuenteActual.metadatos.otros[i].valor = v;
}
function agregarMetaExtra() {
    // 1. Aseguramos que el arreglo 'otros' exista
    if (!fuenteActual.metadatos.otros) {
        fuenteActual.metadatos.otros = [];
    }
    
    // 2. Agregamos el nuevo objeto
    fuenteActual.metadatos.otros.push({ clave: "Nuevo Metadato", valor: "" });
    
    // 3. ¡IMPORTANTE! Refrescamos el HTML del tab para que se vea el cambio
    $("#tab-metadatos").html(renderMetadatosUI());
}
function eliminarMetaExtra(i) {
    if (confirm("¿Eliminar este metadato personalizado?")) {
        // 1. Eliminamos del arreglo
        fuenteActual.metadatos.otros.splice(i, 1);
        
        // 2. Refrescamos la interfaz
        $("#tab-metadatos").html(renderMetadatosUI());
    }
}
function updateDicVal(i, k, v) { 
    fuenteActual.diccionario[i][k] = v; 
}
function agregarCampoDic() { fuenteActual.diccionario.push({ campo: "NUEVO", tipo: "varchar", longitud: "50", nulos: true, default: "", desc: "", catalogo: "" }); renderDiccionarioUI(); }
function eliminarCampoDic(i) { fuenteActual.diccionario.splice(i, 1); renderDiccionarioUI(); }
function cambiarClasifAdmin(sel) { 
    const v = $(sel).val(); 
    fuenteActual.metadatos.clasificacion = v; 
    // Actualizamos el color del banner y el texto
    $("#banner-clasif").css("background", getColor(v));
    $("#banner-clasif span").text("Clasificación: " + v);
}

function guardarCambiosFuentes() {
    // 1. Validación de campos obligatorios
    if (!fuenteActual.id.trim()) {
        alert("Por favor, asigna un ID único a la fuente.");
        showTab($('.tab-btn:contains("Metadatos")'), 'tab-metadatos');
        return;
    }

    if (!fuenteActual.metadatos.nombre.trim()) {
        alert("El nombre de la fuente es obligatorio.");
        showTab($('.tab-btn:contains("Metadatos")'), 'tab-metadatos');
        return;
    }

    // 2. Buscar si estamos editando una fuente existente o creando una nueva
    // Usamos el ID para encontrar la posición en nuestro arreglo global
    const indexExistente = fuentes.findIndex(f => f.id === fuenteActual.id);

    if (indexExistente !== -1) {
        // ACTUALIZAR: Reemplazamos la fuente vieja con la nueva versión editada
        fuentes[indexExistente] = JSON.parse(JSON.stringify(fuenteActual));
    } else {
        // CREAR: La agregamos como un nuevo registro al arreglo
        fuentes.push(JSON.parse(JSON.stringify(fuenteActual)));
    }

    localStorage.setItem('GEMA_FUENTES', JSON.stringify(fuentes));

    // 3. Persistencia visual: Volvemos a pintar las tarjetas del dashboard
    renderFuentes(fuentes);

    // 4. Efecto de cierre
    $("#modal-admin").fadeOut(300, function() {
        // Limpiamos la variable de edición
        fuenteActual = null;
        
        // Feedback de éxito (puedes usar un toast o un alert)
        console.log("Fuente guardada correctamente en el sistema GEMA.");
    });
}

function previewFuente(id) {
    const fuente = fuentes.find(f => f.id === id);
    if (!fuente) return;

    // Lógica inteligente: Si el nombre contiene "Fallidos" o el ID es "SRC-002", filtramos la muestra
    const esFuenteDeErrores = fuente.metadatos.nombre.toLowerCase().includes("fallidos") || fuente.id === "SRC-002";

    const htmlContent = `
        <div class="preview-header">
            <div>
                <h3><img src="imagenes/IconoGEMA.svg" style="height:30px; vertical-align:middle; margin-right:10px;"> Muestra de Datos</h3>
                <p style="margin:5px 0 0 0; color:#718096; font-size:0.9rem;">
                    Fuente: <strong>${fuente.metadatos.nombre}</strong> | 
                    <span>
                        Información
                    </span>
                </p>
            </div>
            <button class="btn-close-preview" onclick="cerrarModalPreview()">&times;</button>
        </div>
        
        <div class="table-responsive-container">
            <table class="gema-table">
                <thead>
                    <tr>
                        <th>ID_REG</th>
                        <th>FECHA_OPERACION</th>
                        <th>USUARIO_RED</th>
                        <th>SUCURSAL</th>
                        <th>TIPO_MOV</th>
                        <th>MONEDA</th>
                        <th>ESTADO</th>
                        <th>REFERENCIA_ALFA</th>
                        <th>IMPORTE_NETO</th>
                        <th>FEC_CARGA_SIST</th>
                    </tr>
                </thead>
                <tbody>
                    ${generarFilasMockPro(esFuenteDeErrores)}
                </tbody>
            </table>
        </div>       
        
    `;

    $("#modal-preview .modal-content").html(htmlContent);
    $("#modal-preview").fadeIn(300);
}

function generarFilasMockPro(soloFallidos = false) {
    let rows = "";
    const usuarios = ["B16847", "B19223", "B00441", "B22910"];
    const sucursales = ["0012 - REFORMA", "0544 - INSURGENTES", "0982 - SANTA FE", "1204 - POLANCO"];
    const tipos = ["ABONO", "CARGO", "TRASPASO", "RETIRO"];
    
    // Si 'soloFallidos' es true, el estado siempre será FALLIDO
    const estadosAleatorios = ["EXITOSO", "EXITOSO", "PENDIENTE", "FALLIDO"];

    for (let i = 1; i <= 10; i++) {
        const estado = soloFallidos ? "FALLIDO" : estadosAleatorios[Math.floor(Math.random() * estadosAleatorios.length)];
        
        // Asignamos la clase CSS según el estado
        let statusClass = "";
        if (estado === "EXITOSO") statusClass = "status-success";
        if (estado === "FALLIDO") statusClass = "status-error";
        // Si es PENDIENTE no lleva clase especial (se queda gris)

        rows += `
            <tr>
                <td><span style="color:#718096; font-family:monospace;">${100500 + i}</span></td>
                <td>2024-03-${10 + i} 09:45:12</td>
                <td><strong>${usuarios[Math.floor(Math.random() * usuarios.length)]}</strong></td>
                <td style="font-size:0.8rem;">${sucursales[Math.floor(Math.random() * sucursales.length)]}</td>
                <td>${tipos[Math.floor(Math.random() * tipos.length)]}</td>
                <td>MXN</td>
                <td><span class="status-pill ${statusClass}">${estado}</span></td>
                <td style="color:#1a365d; font-family:monospace;">REF-BK-${Math.floor(Math.random() * 9000) + 1000}</td>
                <td style="text-align:right; font-weight:bold; color:${estado === 'FALLIDO' ? '#c21832' : '#2d3748'};">
                    $ ${(Math.random() * 15000 + 500).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td style="color:#a0aec0; font-size:0.75rem;">2024-03-21 23:59:59</td>
            </tr>
        `;
    }
    return rows;
}

function cerrarModalPreview() { $("#modal-preview").fadeOut(); }
function eliminarFuente(id) { if(confirm("¿Eliminar?")) { fuentes = fuentes.filter(f => f.id !== id); renderFuentes(fuentes); } }
function getColor(c) { const cs = { "Uso Limitado": "#c21832", "Uso General": "#f08019", "Uso Público": "#44ac34", "NO Significativa": "#5a5959" }; return cs[c] || "#5a5959"; }



function renderReglasUI() {
    // Inicializamos estructuras si no existen
    if (!fuenteActual.reglas) {
        fuenteActual.reglas = { camposExcluidos: [], filtros: [] };
    }

    let html = `
        <div style="margin-bottom: 25px;">
            <h4 style="color:var(--accent-blue); margin-bottom:5px;">1. Visibilidad de Campos</h4>
            <p style="color:#666; font-size:0.85rem;">Selecciona los campos que estarán disponibles para consulta.</p>
            <div class="reglas-grid-fields">
                ${fuenteActual.diccionario.map(campo => {
                    const isExcluido = fuenteActual.reglas.camposExcluidos.includes(campo.campo);
                    return `
                        <div class="field-toggle-card ${isExcluido ? '' : 'active'}" onclick="toggleCampoExposicion('${campo.campo}')">
                            <input type="checkbox" ${isExcluido ? '' : 'checked'} onclick="event.stopPropagation(); toggleCampoExposicion('${campo.campo}')">
                            <span style="font-size:0.9rem; font-weight:600;">${campo.campo}</span>
                        </div>
                    `;
                }).join('')}
            </div>

            <h4 style="color:var(--accent-blue); margin-bottom:5px;">2. Filtros Pre-establecidos</h4>
            <p style="color:#666; font-size:0.85rem;">Define reglas forzosas que se aplicarán a todas las consultas de esta fuente.</p>
            <div class="diccionario-grid">
                ${fuenteActual.reglas.filtros.map((f, i) => `
                    <div class="metadata-card filter-rule-card">
                        <button class="delete-field" onclick="eliminarFiltro(${i})">✕</button>
                        <div class="filter-row">
                            <div style="flex:1;">
                                <label class="label-editable">Campo</label>
                                <select class="form-control-gema" onchange="updateFiltro(${i}, 'campo', this.value)">
                                    <option value="">Selecciona...</option>
                                    ${fuenteActual.diccionario.map(c => `<option value="${c.campo}" ${f.campo==c.campo?'selected':''}>${c.campo}</option>`).join('')}
                                </select>
                            </div>
                            <div style="width:80px;">
                                <label class="label-editable">Operador</label>
                                <select class="form-control-gema" onchange="updateFiltro(${i}, 'operador', this.value)">
                                    <option ${f.operador=='='?'selected':''}>=</option>
                                    <option ${f.operador=='>'?'selected':''}>></option>
                                    <option ${f.operador=='<'?'selected':''}>&lt;</option>
                                    <option ${f.operador=='LIKE'?'selected':''}>LIKE</option>
                                </select>
                            </div>
                            <div style="flex:1;">
                                <label class="label-editable">Valor</label>
                                <input type="text" class="form-control-gema" value="${f.valor}" 
                                    onkeyup="updateFiltro(${i}, 'valor', this.value)" placeholder="Valor de filtro...">
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div class="metadata-card add-dic-card" style="min-height:100px;" onclick="agregarFiltro()">
                    <div style="font-size: 1.5rem; color: #ccc;">+</div>
                    <div style="color: #888; font-weight: bold; font-size: 0.7rem;">AGREGAR FILTRO</div>
                </div>
            </div>
        </div>
    `;

    $("#tab-reglas").html(html);
}

// --- FUNCIONES DE LÓGICA ---

function toggleCampoExposicion(nombreCampo) {
    const lista = fuenteActual.reglas.camposExcluidos;
    const idx = lista.indexOf(nombreCampo);
    if (idx > -1) lista.splice(idx, 1); // Lo quitamos de excluidos (se expone)
    else lista.push(nombreCampo); // Lo agregamos a excluidos (se oculta)
    renderReglasUI();
}

function agregarFiltro() {
    fuenteActual.reglas.filtros.push({ campo: "", operador: "=", valor: "" });
    renderReglasUI();
}

function eliminarFiltro(i) {
    fuenteActual.reglas.filtros.splice(i, 1);
    renderReglasUI();
}

function updateFiltro(i, key, val) {
    fuenteActual.reglas.filtros[i][key] = val;
}