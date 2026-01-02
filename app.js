document.addEventListener("DOMContentLoaded", function () {
    // ===== ELEMENTOS DO DOM =====
    const colaboradorForm = document.getElementById('colaboradorForm');
    const etapa1 = document.getElementById('etapa1');
    const etapa2 = document.getElementById('etapa2');
    const reportForm = document.getElementById('reportForm');
    const reportTableBody = document.getElementById('reportTableBody');
    const totalsList = document.getElementById('totalsList');
    const exportPdfButton = document.getElementById('exportPdfButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const numeroLinhaContainer = document.getElementById('numeroLinhaContainer');
    const tipoLinhaContainer = document.getElementById('tipoLinhaContainer');
    const valorContainer = document.getElementById('valorContainer');
    const modalSelect = document.getElementById('modal');
    const bilhetagemSelect = document.getElementById('bilhetagem');
    const tipoLinhaSelect = document.getElementById('tipoLinha');
    const otherField = document.getElementById('otherField');
    const integracaoModal = document.getElementById('integracaoModal');
    const tipoRelatorioSelect = document.getElementById('tipoRelatorio');
    const periodoReembolsoContainer = document.getElementById('periodoReembolsoContainer');
    const btnAutorizar = document.getElementById('btnAutorizar');
    const backButton = document.getElementById('backButton');
    const currentStep = document.getElementById('currentStep');
    const colaboradorNome = document.getElementById('colaboradorNome');
    const totalPassagens = document.getElementById('totalPassagens');
    const totalSemanal = document.getElementById('totalSemanal');
    const mediaDiaria = document.getElementById('mediaDiaria');
    const diasRegistro = document.getElementById('diasRegistro');
    const reportSummaryRow = document.getElementById('reportSummaryRow');
    const mediaPorPassagemCell = document.getElementById('mediaPorPassagemCell');
    const valorIntegracao = document.getElementById('valorIntegracao');
    const toast = document.getElementById('toast');
    const confirmacaoIntegracaoModal = document.getElementById('confirmacaoIntegracaoModal');
    const valorIntegracaoEdit = document.getElementById('valorIntegracaoEdit');

    // Elementos da assinatura
    const canvasColaborador = document.getElementById('canvasColaborador');
    const limparAssinaturaBtn = document.getElementById('limparAssinaturaColaborador');
    const assinaturaTrigger = document.getElementById('assinaturaTrigger');
    const fullscreenSignature = document.getElementById('fullscreenSignature');
    const fullscreenCanvas = document.getElementById('fullscreenCanvas');
    const closeFullscreenBtn = document.getElementById('closeFullscreen');
    const clearFullscreenBtn = document.getElementById('clearFullscreen');
    const confirmSignatureBtn = document.getElementById('confirmSignature');
    const orientationAlert = document.getElementById('orientationAlert');
    const canvasOverlay = document.getElementById('canvasOverlay');
    const assinaturaContainer = document.getElementById('assinaturaContainer');
    const termoNome = document.getElementById('termoNome');
    const termoEndereco = document.getElementById('termoEndereco');

    // ===== VARIÁVEIS DE ESTADO =====
    let reports = [];
    let dailyTotals = {};
    let colaboradorData = {};
    let assinaturaColaborador = null;
    let editingIndex = null; // índice da passagem que está sendo editada
    let isDrawing = false;
    let isDrawingFullscreen = false;
    let ctxColaborador;
    let ctxFullscreen;

    // ===== FUNÇÃO AUXILIAR PARA CANVAS =====
    function setupCanvasContext(ctx, canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#FFFFFF';

        // Preencher fundo branco
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ===== CONFIGURAÇÕES DE MODAIS =====
    const modalConfig = {
        'rio card': {
            modais: [
                { value: 'ônibus', label: 'Ônibus' },
                { value: 'metrô', label: 'Metrô' },
                { value: 'barcas', label: 'Barcas' },
                { value: 'trem', label: 'Trem' }
            ],
            tipoLinha: [
                { value: 'intermunicipal', label: 'Intermunicipal' }
            ]
        },
        'jaé': {
            modais: [
                { value: 'ônibus', label: 'Ônibus' },
                { value: 'van', label: 'Van' },
                { value: 'brt', label: 'BRT' },
                { value: 'vlt', label: 'VLT' }
            ],
            tipoLinha: [
                { value: 'municipal', label: 'Municipal' }
            ]
        },
        'caju cartão mobilidade': {
            // Mesmos modais/tipos de "outros"
            modais: [
                { value: 'ônibus', label: 'Ônibus' },
                { value: 'metrô', label: 'Metrô' },
                { value: 'trem', label: 'Trem' },
                { value: 'van', label: 'Van' },
                { value: 'barcas', label: 'Barcas' },
                { value: 'brt', label: 'BRT' },
                { value: 'vlt', label: 'VLT' },
                { value: 'a pé', label: 'A Pé' }
            ],
            tipoLinha: [
                { value: 'municipal', label: 'Municipal' },
                { value: 'intermunicipal', label: 'Intermunicipal' }
            ]
        },
        'outros': {
            modais: [
                { value: 'a pé', label: 'A Pé' }
            ],
            tipoLinha: [
                { value: 'municipal', label: 'Municipal' },
                { value: 'intermunicipal', label: 'Intermunicipal' }
            ]
        }
    };

    // ===== INICIALIZAÇÃO =====
    function init() {
        console.log('Inicializando sistema...');

        // Garantir visibilidade correta das etapas ao iniciar
        etapa1.style.display = 'block';
        etapa2.style.display = 'none';
        currentStep.textContent = 'Etapa 1 de 2';

        // Configurar data de envio como hoje
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('dataEnvio').value = hoje;

        // Configurar data de início e fim (uma semana atrás até hoje)
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        document.getElementById('dataInicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('dataFim').value = hoje;

        // Inicializar assinatura
        initSignaturePad();

        // Configurar eventos
        setupEventListeners();

        // Atualizar opções iniciais
        updateModalOptions('rio card');

        console.log('Sistema inicializado com sucesso!');
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    function setupEventListeners() {
        console.log('Configurando event listeners...');

        // Formulários
        colaboradorForm.addEventListener('submit', handleColaboradorSubmit);
        reportForm.addEventListener('submit', handleReportSubmit);

        // Elementos do formulário
        tipoRelatorioSelect.addEventListener('change', handleTipoRelatorioChange);
        bilhetagemSelect.addEventListener('change', handleBilhetagemChange);
        modalSelect.addEventListener('change', handleModalChange);

        // Telefone
        document.getElementById('telefone').addEventListener('input', formatTelefone);

        // Nome do colaborador (atualizar termo em tempo real)
        document.getElementById('nomeCompleto').addEventListener('input', updateTermo);
        document.getElementById('endereco').addEventListener('input', updateTermo);
        document.getElementById('bairro').addEventListener('input', updateTermo);
        document.getElementById('cidade').addEventListener('input', updateTermo);

        // Botões
        exportPdfButton.addEventListener('click', exportToPDF);
        clearAllButton.addEventListener('click', clearAllReports);
        backButton.addEventListener('click', voltarParaEtapa1);

        // Modal de integração
        document.getElementById('btnSimIntegracao').addEventListener('click', handleIntegracaoSim);
        document.getElementById('btnNaoIntegracao').addEventListener('click', handleIntegracaoNao);

        // Modal de confirmação de integração
        document.getElementById('btnConfirmarIntegracao').addEventListener('click', handleConfirmarIntegracao);
        document.getElementById('btnCancelarIntegracao').addEventListener('click', handleCancelarIntegracao);

        console.log('Event listeners configurados!');
    }

    // ===== ASSINATURA DIGITAL (COMPUTADOR E MOBILE) =====
    function initSignaturePad() {
        console.log('Inicializando assinatura digital...');

        if (!canvasColaborador) {
            console.error('Canvas de assinatura não encontrado!');
            return;
        }

        // Configurar canvas pequeno
        ctxColaborador = canvasColaborador.getContext('2d');
        setupCanvasContext(ctxColaborador, canvasColaborador);

        // Configurar canvas de tela cheia
        ctxFullscreen = fullscreenCanvas.getContext('2d');

        // Event listeners para assinatura
        assinaturaTrigger.addEventListener('click', openFullscreenSignature);
        closeFullscreenBtn.addEventListener('click', closeFullscreenSignature);
        clearFullscreenBtn.addEventListener('click', clearFullscreenCanvas);
        confirmSignatureBtn.addEventListener('click', confirmFullscreenSignature);
        limparAssinaturaBtn.addEventListener('click', clearSmallCanvas);

        // Configurar eventos de desenho no canvas pequeno (para assinatura direta no computador)
        setupCanvasDrawing(canvasColaborador, 'small');

        // Configurar eventos para o canvas de tela cheia
        setupCanvasDrawing(fullscreenCanvas, 'fullscreen');

        // Atualizar botão de assinatura com texto dinâmico
        updateSignatureButtonText();

        console.log('Assinatura digital inicializada!');
    }

    function setupCanvasDrawing(canvas, type) {
        const isFullscreen = type === 'fullscreen';
        const ctx = isFullscreen ? ctxFullscreen : ctxColaborador;
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Função para obter coordenadas corretas
        function getCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;

            if (e.type.includes('touch')) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            return [
                clientX - rect.left,
                clientY - rect.top
            ];
        }

        // Função para calcular escala
        function getScale(canvas) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: canvas.width / rect.width,
                y: canvas.height / rect.height
            };
        }

        // Evento: Iniciar desenho
        function startDrawing(e) {
            e.preventDefault();
            isDrawing = true;

            if (isFullscreen) {
                canvasOverlay.classList.add('hidden');
            } else {
                // Esconder instrução de toque no canvas pequeno
                document.querySelectorAll('.canvas-instruction').forEach(el => {
                    el.classList.add('hidden');
                });
            }

            const [x, y] = getCoordinates(e);
            const scale = getScale(canvas);

            lastX = x * scale.x;
            lastY = y * scale.y;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
        }

        // Evento: Desenhar
        function draw(e) {
            if (!isDrawing) return;

            const [x, y] = getCoordinates(e);
            const scale = getScale(canvas);

            const currentX = x * scale.x;
            const currentY = y * scale.y;

            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            lastX = currentX;
            lastY = currentY;
        }

        // Evento: Parar desenho
        function stopDrawing() {
            isDrawing = false;
            ctx.beginPath();

            if (!isFullscreen) {
                // Salvar assinatura do canvas pequeno
                if (canvasColaborador.toDataURL() !== 'data:,') {
                    assinaturaColaborador = canvasColaborador.toDataURL();
                    validateSignature();
                }
            }
        }

        // Configurar eventos de mouse (computador)
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Configurar eventos de toque (mobile)
        canvas.addEventListener('touchstart', function (e) {
            startDrawing(e);
        }, { passive: false });

        canvas.addEventListener('touchmove', function (e) {
            draw(e);
        }, { passive: false });

        canvas.addEventListener('touchend', stopDrawing);

        // Prevenir comportamento padrão de arrastar na imagem
        canvas.addEventListener('dragstart', function (e) {
            e.preventDefault();
            return false;
        });

        // Configurar contexto do canvas usando helper global
        function resizeCanvas() {
            setupCanvasContext(ctx, canvas);
        }

        resizeCanvas();

        // Redimensionar canvas quando a janela mudar de tamanho
        const resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
            // Redesenhar assinatura existente se houver
            if (!isFullscreen && assinaturaColaborador) {
                const img = new Image();
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = assinaturaColaborador;
            }
        });

        resizeObserver.observe(canvas);
    }

    function updateSignatureButtonText() {
        // Função mantida vazia para evitar erros caso seja chamada,
        // pois os elementos de texto de gatilho não existem mais no HTML.
    }

    function clearSmallCanvas() {
        ctxColaborador.clearRect(0, 0, canvasColaborador.width, canvasColaborador.height);
        ctxColaborador.fillStyle = '#FFFFFF';
        ctxColaborador.fillRect(0, 0, canvasColaborador.width, canvasColaborador.height);
        assinaturaColaborador = null;
        validateSignature();

        // Se existirem instruções no DOM, reexibir
        document.querySelectorAll('.canvas-instruction').forEach(el => {
            el.classList.remove('hidden');
        });
    }

    function openFullscreenSignature() {
        console.log('Abrindo tela cheia de assinatura...');

        // Configurar canvas de tela cheia
        fullscreenCanvas.width = fullscreenCanvas.offsetWidth;
        fullscreenCanvas.height = fullscreenCanvas.offsetHeight;

        ctxFullscreen.lineWidth = 2;
        ctxFullscreen.lineCap = 'round';
        ctxFullscreen.lineJoin = 'round';
        ctxFullscreen.strokeStyle = '#000000';
        ctxFullscreen.fillStyle = '#FFFFFF';
        ctxFullscreen.fillRect(0, 0, fullscreenCanvas.width, fullscreenCanvas.height);

        // Copiar assinatura existente se houver
        if (assinaturaColaborador) {
            const img = new Image();
            img.onload = function () {
                ctxFullscreen.drawImage(img, 0, 0, fullscreenCanvas.width, fullscreenCanvas.height);
            };
            img.src = assinaturaColaborador;
        }

        fullscreenSignature.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Forçar orientação paisagem se suportado e for mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            lockOrientation();
        }

        // Mostrar overlay inicial
        canvasOverlay.classList.remove('hidden');
    }

    // (confirmação da assinatura já foi implementada acima; removidas versões duplicadas)

    function clearFullscreenCanvas() {
        ctxFullscreen.clearRect(0, 0, fullscreenCanvas.width, fullscreenCanvas.height);
        ctxFullscreen.fillStyle = '#FFFFFF';
        ctxFullscreen.fillRect(0, 0, fullscreenCanvas.width, fullscreenCanvas.height);
        canvasOverlay.classList.remove('hidden');
    }

    function closeFullscreenSignature() {
        fullscreenSignature.classList.add('hidden');
        document.body.style.overflow = 'auto';
        unlockOrientation();
    }

    function confirmFullscreenSignature() {
        // Copiar assinatura da tela cheia para o canvas pequeno
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = canvasColaborador.width;
        tempCanvas.height = canvasColaborador.height;

        // Redimensionar imagem
        tempCtx.drawImage(fullscreenCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

        // Desenhar no canvas pequeno
        clearSmallCanvas();
        ctxColaborador.drawImage(tempCanvas, 0, 0);

        // Salvar assinatura
        assinaturaColaborador = canvasColaborador.toDataURL();
        validateSignature();

        closeFullscreenSignature();
        showToast('Assinatura confirmada com sucesso!');
    }

    function lockOrientation() {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').then(() => {
                console.log('Orientação travada para paisagem');
                orientationAlert.classList.add('hidden');
            }).catch(err => {
                console.warn('Não foi possível travar orientação:', err);
                orientationAlert.classList.remove('hidden');
            });
        } else {
            orientationAlert.classList.remove('hidden');
        }
    }

    function unlockOrientation() {
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }

    function validateSignature() {
        // Assinatura é opcional: manter botão sempre habilitado
        btnAutorizar.disabled = false;
        btnAutorizar.classList.remove('disabled');
    }

    // ===== ATUALIZAÇÃO DO TERMO =====
    function updateTermo() {
        const nome = document.getElementById('nomeCompleto').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const bairro = document.getElementById('bairro').value.trim();
        const cidade = document.getElementById('cidade').value.trim();

        // Atualizar termo
        if (nome) {
            termoNome.textContent = nome.toUpperCase();
        } else {
            termoNome.textContent = '[NOME DO COLABORADOR]';
        }

        if (endereco && bairro && cidade) {
            termoEndereco.textContent = `${endereco}, ${bairro}, ${cidade}`.toUpperCase();
        } else {
            termoEndereco.textContent = '[ENDEREÇO COMPLETO]';
        }

        // Mostrar/ocultar container de assinatura quando nome for preenchido
        if (nome.trim() !== '') {
            assinaturaContainer.classList.remove('hidden');
        } else {
            assinaturaContainer.classList.add('hidden');
        }
    }

    // ===== MANIPULAÇÃO DE FORMULÁRIOS =====
    function handleTipoRelatorioChange() {
        const tipo = this.value;
        console.log('Tipo de relatório selecionado:', tipo);

        if (tipo === 'Reembolso') {
            periodoReembolsoContainer.classList.remove('hidden');
            document.getElementById('dataInicio').required = true;
            document.getElementById('dataFim').required = true;
        } else {
            periodoReembolsoContainer.classList.add('hidden');
            document.getElementById('dataInicio').required = false;
            document.getElementById('dataFim').required = false;
        }
    }

    function handleBilhetagemChange() {
        const bilhetagem = this.value;
        console.log('Bilhetagem selecionada:', bilhetagem);

        // Campo "Especifique o tipo" não é mais utilizado
        otherField.classList.add('hidden');

        // Atualizar opções de modal
        updateModalOptions(bilhetagem);
    }

    function updateModalOptions(bilhetagem) {
        const bilhetagemKey = bilhetagem.toLowerCase();
        const config = modalConfig[bilhetagemKey] || modalConfig['outros'];

        console.log('Atualizando modais para:', bilhetagemKey, config);

        // Limpar opções atuais
        modalSelect.innerHTML = '<option value="">Selecione...</option>';

        // Adicionar novas opções
        config.modais.forEach(modal => {
            const option = document.createElement('option');
            option.value = modal.value;
            option.textContent = modal.label;
            modalSelect.appendChild(option);
        });

        // Atualizar opções de tipo de linha
        updateTipoLinhaOptions(bilhetagemKey);

        // Atualizar campos visíveis
        handleModalChange();
    }

    function updateTipoLinhaOptions(bilhetagem) {
        const bilhetagemKey = bilhetagem.toLowerCase();
        const config = modalConfig[bilhetagemKey] || modalConfig['outros'];

        // Limpar opções atuais
        tipoLinhaSelect.innerHTML = '<option value="">Selecione...</option>';

        // Adicionar novas opções
        config.tipoLinha.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.value;
            option.textContent = tipo.label;
            tipoLinhaSelect.appendChild(option);
        });
    }

    function handleModalChange() {
        const modal = modalSelect.value;
        console.log('Modal selecionado:', modal);

        if (modal === 'ônibus') {
            numeroLinhaContainer.classList.remove('hidden');
            tipoLinhaContainer.classList.remove('hidden');
            valorContainer.classList.remove('hidden');
        } else if (modal === 'a pé') {
            numeroLinhaContainer.classList.add('hidden');
            tipoLinhaContainer.classList.add('hidden');
            valorContainer.classList.remove('hidden');
            document.getElementById('valor').value = '0,00';
        } else {
            numeroLinhaContainer.classList.add('hidden');
            tipoLinhaContainer.classList.add('hidden');
            valorContainer.classList.remove('hidden');
        }
    }

    // ===== FORMATADORES =====
    function formatTelefone(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        if (value.length <= 10) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else {
            value = value.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
        }

        e.target.value = value;
    }

    // Função global para formatar valor
    window.formatValor = function (input) {
        let valor = input.value.replace(/[^\d]/g, '');

        // Permite valores até R$ 999,99 (6 dígitos)
        if (valor.length > 6) {
            valor = valor.substring(0, 6);
        }

        if (valor.length === 0) {
            input.value = '';
            return;
        }

        // Converte para número e formata com 2 decimais
        const valorNumerico = parseFloat(valor) / 100;
        input.value = valorNumerico.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // ===== VALIDAÇÕES =====
    function validateTelefone(telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');

        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            return false;
        }

        const ddd = telefoneLimpo.substring(0, 2);
        const dddsValidos = ['11', '12', '13', '14', '15', '16', '17', '18', '19',
            '21', '22', '24', '27', '28', '31', '32', '33', '34',
            '35', '37', '38', '41', '42', '43', '44', '45', '46',
            '47', '48', '49', '51', '53', '54', '55', '61', '62',
            '63', '64', '65', '66', '67', '68', '69', '71', '73',
            '74', '75', '77', '79', '81', '82', '83', '84', '85',
            '86', '87', '88', '89', '91', '92', '93', '94', '95',
            '96', '97', '98', '99'];

        return dddsValidos.includes(ddd);
    }

    function validatePeriodoReembolso() {
        const tipoRelatorio = document.getElementById('tipoRelatorio').value;
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');

        if (tipoRelatorio === 'Reembolso') {
            if (!dataInicio.value || !dataFim.value) {
                showToast('Por favor, preencha o período do reembolso (data início e data fim).', 'error');
                return false;
            }

            const inicio = new Date(dataInicio.value);
            const fim = new Date(dataFim.value);

            if (inicio > fim) {
                showToast('A data de início deve ser anterior à data de fim.', 'error');
                return false;
            }

            const diffTime = Math.abs(fim - inicio);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 31) {
                if (!confirm(`O período selecionado é de ${diffDays} dias. Deseja continuar?`)) {
                    return false;
                }
            }
        }

        return true;
    }

    // ===== MANIPULADORES DE SUBMIT =====
    function handleColaboradorSubmit(event) {
        event.preventDefault();
        console.log('Submetendo formulário do colaborador...');

        // Validar checkbox de autorização
        if (!document.getElementById('autorizacao').checked) {
            showToast('Você precisa marcar a caixa de autorização antes de salvar os dados.', 'error');
            return;
        }

        // Validar telefone
        const telefone = document.getElementById('telefone').value;
        if (!validateTelefone(telefone)) {
            showToast('Por favor, insira um telefone válido com DDD (ex: (11) 99999-9999).', 'error');
            return;
        }

        // Validar período de reembolso se necessário
        if (!validatePeriodoReembolso()) {
            return;
        }

        // Capturar dados do período de reembolso
        let periodoReembolso = null;
        if (document.getElementById('tipoRelatorio').value === 'Reembolso') {
            periodoReembolso = {
                dataInicio: document.getElementById('dataInicio').value,
                dataFim: document.getElementById('dataFim').value
            };
        }

        // Salvar dados do colaborador
        colaboradorData = {
            nomeCompleto: document.getElementById('nomeCompleto').value.trim().toUpperCase(),
            endereco: document.getElementById('endereco').value.trim().toUpperCase(),
            bairro: document.getElementById('bairro').value.trim().toUpperCase(),
            cidade: document.getElementById('cidade').value.trim().toUpperCase(),
            telefone: telefone,
            dataEnvio: document.getElementById('dataEnvio').value,
            tipoRelatorio: document.getElementById('tipoRelatorio').value.toUpperCase(),
            periodoReembolso: periodoReembolso,
            equipe: document.getElementById('equipe').value.toUpperCase(),
            autorizacao: document.getElementById('autorizacao').checked,
            assinaturaColaborador: assinaturaColaborador
        };

        // Atualizar nome na etapa 2
        colaboradorNome.textContent = colaboradorData.nomeCompleto;

        // Ir para etapa 2
        etapa1.style.display = 'none';
        etapa2.style.display = 'block';
        currentStep.textContent = 'Etapa 2 de 2';

        showToast('Dados salvos com sucesso! Agora adicione suas passagens.');
        console.log('Colaborador data saved:', colaboradorData);
    }

    function handleReportSubmit(event) {
        event.preventDefault();
        console.log('Submetendo formulário de passagem...');

        // Capturar o valor da bilhetagem (sem "especifique o tipo")
        const bilhetagem = document.getElementById('bilhetagem').value;

        // Parse do valor
        let valorInput = document.getElementById('valor').value.trim();
        valorInput = valorInput.replace(/[^\d.,]/g, '');
        valorInput = valorInput.replace(',', '.');

        const partes = valorInput.split('.');
        if (partes.length > 2) {
            valorInput = partes.slice(0, -1).join('') + '.' + partes[partes.length - 1];
        }

        const valor = parseFloat(valorInput) || 0;

        // Validação de valor negativo
        if (valor < 0) {
            showToast('O valor não pode ser negativo.', 'error');
            return;
        }

        const modal = modalSelect.value;

        // Validação: se modal não é "a pé", valor deve ser maior que 0
        if (modal !== 'a pé' && valor <= 0) {
            showToast('Por favor, insira um valor válido para o transporte.', 'error');
            return;
        }

        // Preparar dados do relatório
        const reportData = {
            dataVisita: document.getElementById('dataVisita').value,
            ida: document.getElementById('ida').value.trim(),
            destino: document.getElementById('destino').value.trim(),
            bilhetagem: bilhetagem,
            modal: modal,
            valor: valor,
            numeroLinha: document.getElementById('numeroLinha').value.trim(),
            tipoLinha: document.getElementById('tipoLinha').value,
            timestamp: new Date().toISOString()
        };

        // Converter para maiúsculas para exibição
        reportData.dataVisita = reportData.dataVisita.toUpperCase();
        reportData.ida = reportData.ida.toUpperCase();
        reportData.destino = reportData.destino.toUpperCase();
        reportData.bilhetagem = reportData.bilhetagem.toUpperCase();
        reportData.modal = reportData.modal.toUpperCase();
        reportData.numeroLinha = reportData.numeroLinha.toUpperCase();
        reportData.tipoLinha = reportData.tipoLinha.toUpperCase();

        if (reportData.modal === 'A PÉ') {
            reportData.valor = 0;
            reportData.tipoLinha = '';
        }

        // Verificar se é duplicado (apenas quando NÃO estiver editando)
        if (editingIndex === null && isDuplicateReport(reportData)) {
            showToast('Este relatório parece ser duplicado. Verifique os dados.', 'warning');
            return;
        }

        // Se estiver editando uma passagem existente, apenas atualiza os dados
        if (editingIndex !== null) {
            // Preservar informação de integração já existente, se houver
            if (reports[editingIndex] && reports[editingIndex].integracao) {
                reportData.integracao = reports[editingIndex].integracao;
            } else if (!reportData.integracao) {
                reportData.integracao = 'NÃO';
            }

            reports[editingIndex] = reportData;
            rebuildReportTable();
            updateTotals();
            updateResumo();
            showToast('Passagem atualizada com sucesso!');

            // Resetar formulário e voltar ao modo "adicionar"
            reportForm.reset();
            document.getElementById('dataVisita').value = '';
            updateModalOptions('rio card');
            handleModalChange();
            resetReportFormToCreateMode();
            return;
        }

        // Decidir se mostra o modal de integração
        // IMPORTANTE: Modal de integração só aparece a partir da 2ª passagem do dia
        // (sem limitação de valor - pode ser qualquer valor)

        // Contar quantas passagens já existem no mesmo dia
        const passagensDoDia = reports.filter(r =>
            r.dataVisita.toLowerCase() === reportData.dataVisita.toLowerCase()
        ).length;

        // Só mostrar modal de integração se já existe pelo menos 1 passagem no mesmo dia
        // (não é a primeira passagem do dia)
        const naoEhPrimeiraPassagemDoDia = passagensDoDia >= 1;

        if (naoEhPrimeiraPassagemDoDia) {
            valorIntegracao.textContent = `R$ ${valor.toFixed(2)}`;
            // Remover classe "hidden" para exibir o modal corretamente
            integracaoModal.classList.remove('hidden');
            integracaoModal.currentReport = reportData;
        } else {
            // É a primeira passagem do dia (não pode ser integração)
            reportData.integracao = 'NÃO';
            addReportDirectly(reportData);
        }

        // Resetar formulário
        reportForm.reset();
        document.getElementById('dataVisita').value = '';
        updateModalOptions('rio card');
        handleModalChange();

        console.log('Passagem registrada:', reportData);
    }

    function handleIntegracaoSim() {
        const reportData = integracaoModal.currentReport;

        // Verificar se existe uma passagem anterior
        if (reports.length === 0) {
            showToast('Não há passagem anterior para vincular a integração. Adicione uma passagem primeiro.', 'warning');
            integracaoModal.classList.add('hidden');
            integracaoModal.currentReport = null;
            return;
        }

        // Pegar a última passagem adicionada (primeira da integração)
        const primeiraPassagem = reports[reports.length - 1];

        // Preencher o modal de confirmação com os dados
        preencherModalConfirmacaoIntegracao(primeiraPassagem, reportData);

        // Fechar modal de integração e abrir modal de confirmação
        integracaoModal.classList.add('hidden');
        confirmacaoIntegracaoModal.classList.remove('hidden');
    }

    function preencherModalConfirmacaoIntegracao(primeiraPassagem, segundaPassagem) {
        // Preencher dados da primeira passagem
        document.getElementById('modalPrimeiraDia').textContent = primeiraPassagem.dataVisita || '-';
        document.getElementById('modalPrimeiraOrigem').textContent = primeiraPassagem.ida || '-';
        document.getElementById('modalPrimeiraDestino').textContent = primeiraPassagem.destino || '-';
        document.getElementById('modalPrimeiraModal').textContent = primeiraPassagem.modal || '-';
        document.getElementById('modalPrimeiraValorAtual').textContent = `R$ ${(primeiraPassagem.valor || 0).toFixed(2)}`;

        // Preencher dados da segunda passagem
        document.getElementById('modalSegundaDia').textContent = segundaPassagem.dataVisita || '-';
        document.getElementById('modalSegundaOrigem').textContent = segundaPassagem.ida || '-';
        document.getElementById('modalSegundaDestino').textContent = segundaPassagem.destino || '-';
        document.getElementById('modalSegundaModal').textContent = segundaPassagem.modal || '-';

        // Preencher campo de valor da integração com o valor informado
        const valorFormatado = (segundaPassagem.valor || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        valorIntegracaoEdit.value = valorFormatado;

        // Armazenar referências para uso na confirmação
        confirmacaoIntegracaoModal.primeiraPassagemIndex = reports.length - 1;
        confirmacaoIntegracaoModal.segundaPassagemData = segundaPassagem;
    }

    function handleConfirmarIntegracao() {
        // Validar valor informado
        let valorInput = valorIntegracaoEdit.value.trim();
        valorInput = valorInput.replace(/[^\d.,]/g, '');
        valorInput = valorInput.replace(',', '.');

        const partes = valorInput.split('.');
        if (partes.length > 2) {
            valorInput = partes.slice(0, -1).join('') + '.' + partes[partes.length - 1];
        }

        const valorIntegracao = parseFloat(valorInput) || 0;

        if (valorIntegracao < 0) {
            showToast('O valor não pode ser negativo.', 'error');
            return;
        }

        if (valorIntegracao === 0) {
            showToast('Por favor, informe um valor válido para a integração.', 'error');
            return;
        }

        // Pegar referências armazenadas
        const primeiraIndex = confirmacaoIntegracaoModal.primeiraPassagemIndex;
        const segundaPassagemData = confirmacaoIntegracaoModal.segundaPassagemData;

        if (primeiraIndex === undefined || primeiraIndex < 0 || primeiraIndex >= reports.length) {
            showToast('Erro ao processar integração. Tente novamente.', 'error');
            confirmacaoIntegracaoModal.classList.add('hidden');
            return;
        }

        // Atualizar primeira passagem: alterar valor e marcar como integração
        reports[primeiraIndex].valor = valorIntegracao;
        reports[primeiraIndex].integracao = 'SIM';

        // Adicionar segunda passagem: zerar valor e marcar como integração
        segundaPassagemData.valor = 0;
        segundaPassagemData.integracao = 'SIM';
        reports.push(segundaPassagemData);

        // Reconstruir tabela e atualizar totais
        rebuildReportTable();
        updateTotals();
        updateResumo();

        // Fechar modal e resetar formulário
        confirmacaoIntegracaoModal.classList.add('hidden');
        reportForm.reset();
        document.getElementById('dataVisita').value = '';
        updateModalOptions('rio card');
        handleModalChange();

        // Limpar referências
        confirmacaoIntegracaoModal.primeiraPassagemIndex = null;
        confirmacaoIntegracaoModal.segundaPassagemData = null;

        showToast('Integração confirmada! Valor da primeira passagem atualizado e segunda zerada.', 'success');
    }

    function handleCancelarIntegracao() {
        // Fechar modal e limpar referências
        confirmacaoIntegracaoModal.classList.add('hidden');
        confirmacaoIntegracaoModal.primeiraPassagemIndex = null;
        confirmacaoIntegracaoModal.segundaPassagemData = null;

        // Resetar formulário
        reportForm.reset();
        document.getElementById('dataVisita').value = '';
        updateModalOptions('rio card');
        handleModalChange();

        showToast('Operação cancelada.', 'info');
    }

    function handleIntegracaoNao() {
        const reportData = integracaoModal.currentReport;
        reportData.integracao = 'NÃO';
        addReportDirectly(reportData);
        integracaoModal.classList.add('hidden');
        integracaoModal.currentReport = null;
    }

    // ===== FUNÇÕES AUXILIARES DE RELATÓRIOS =====
    function isDuplicateReport(newReport) {
        return reports.some(report =>
            report.dataVisita === newReport.dataVisita &&
            report.ida === newReport.ida &&
            report.destino === newReport.destino &&
            report.valor === newReport.valor &&
            Math.abs(new Date(report.timestamp) - new Date(newReport.timestamp)) < 60000
        );
    }

    function addReportDirectly(reportData) {
        reports.push(reportData);
        addReportToTable(reportData);
        updateTotals();
        updateResumo();
        showToast('Passagem adicionada com sucesso!');
    }

    function addReportToTable(report) {
        // Remover linha vazia se existir
        const emptyRow = document.querySelector('.empty-row');
        if (emptyRow) {
            emptyRow.remove();
        }

        const row = document.createElement('tr');

        const cells = [
            report.dataVisita,
            report.ida,
            report.destino,
            report.bilhetagem,
            report.modal,
            report.numeroLinha || '-',
            report.tipoLinha || '-',
            report.integracao || 'NÃO',
            `R$ ${report.valor.toFixed(2)}`
        ];

        cells.forEach(text => {
            const cell = document.createElement('td');
            cell.textContent = text;
            row.appendChild(cell);
        });

        const acoes = document.createElement('td');

        // Botão de edição
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-secondary btn-small';
        editButton.innerHTML = '<i class="fas fa-pen"></i>';
        editButton.title = 'Editar passagem';
        editButton.onclick = function () { editReport(this); };
        acoes.appendChild(editButton);

        // Botão de remoção
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-danger btn-small';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'Remover passagem';
        deleteButton.onclick = function () { removeReport(this); };
        acoes.appendChild(deleteButton);

        row.appendChild(acoes);

        reportTableBody.appendChild(row);
    }

    function updateTotals() {
        dailyTotals = {};
        reports.forEach(report => {
            const day = report.dataVisita;
            dailyTotals[day] = (dailyTotals[day] || 0) + report.valor;
        });

        totalsList.innerHTML = '';

        for (const [day, total] of Object.entries(dailyTotals)) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${day}:</span>
                <strong>R$ ${total.toFixed(2)}</strong>
            `;
            totalsList.appendChild(li);
        }
    }

    function updateResumo() {
        // Atualizar contador de passagens
        totalPassagens.textContent = reports.length;

        // Calcular total semanal
        const total = reports.reduce((sum, report) => sum + report.valor, 0);
        totalSemanal.textContent = `R$ ${total.toFixed(2)}`;

        // Calcular média diária
        const diasUnicos = new Set(reports.map(r => r.dataVisita)).size;
        const media = diasUnicos > 0 ? total / diasUnicos : 0;
        mediaDiaria.textContent = `R$ ${media.toFixed(2)}`;

        // Atualizar dias com registro
        diasRegistro.textContent = diasUnicos;

        // Atualizar linha de média na tabela (média por passagem)
        if (reportSummaryRow && mediaPorPassagemCell) {
            if (reports.length > 0) {
                const mediaPorPassagem = total / reports.length;
                mediaPorPassagemCell.textContent = `R$ ${mediaPorPassagem.toFixed(2)}`;
                reportSummaryRow.classList.remove('hidden');
            } else {
                mediaPorPassagemCell.textContent = 'R$ 0,00';
                reportSummaryRow.classList.add('hidden');
            }
        }
    }

    // Função global para remover relatórios
    window.removeReport = function (button) {
        if (!confirm('Tem certeza que deseja remover esta passagem?')) {
            return;
        }

        const row = button.closest('tr');
        const index = Array.from(reportTableBody.children).indexOf(row);

        reports.splice(index, 1);
        row.remove();

        // Ajustar estado de edição se necessário
        if (editingIndex !== null) {
            if (index === editingIndex) {
                editingIndex = null;
                resetReportFormToCreateMode();
            } else if (index < editingIndex) {
                editingIndex -= 1;
            }
        }

        // Se não houver mais passagens, mostrar linha vazia
        if (reports.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-row';
            emptyRow.innerHTML = `
                <td colspan="10">
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Nenhuma passagem registrada ainda</p>
                        <small>Adicione sua primeira passagem usando o formulário acima</small>
                    </div>
                </td>
            `;
            reportTableBody.appendChild(emptyRow);
        }

        updateTotals();
        updateResumo();
        showToast('Passagem removida com sucesso!');
    };

    // Função global para editar relatórios
    window.editReport = function (button) {
        const row = button.closest('tr');
        const index = Array.from(reportTableBody.children).indexOf(row);

        const report = reports[index];
        if (!report) return;

        editingIndex = index;

        // Preencher formulário com os dados existentes
        document.getElementById('dataVisita').value = (report.dataVisita || '').toLowerCase();
        document.getElementById('ida').value = report.ida || '';
        document.getElementById('destino').value = report.destino || '';

        const bilhetagemLower = (report.bilhetagem || '').toLowerCase();
        document.getElementById('bilhetagem').value = bilhetagemLower;
        updateModalOptions(bilhetagemLower || 'rio card');

        const modalLower = (report.modal || '').toLowerCase();
        modalSelect.value = modalLower;
        handleModalChange();

        document.getElementById('numeroLinha').value = report.numeroLinha || '';
        document.getElementById('tipoLinha').value = (report.tipoLinha || '').toLowerCase();

        const valorInput = document.getElementById('valor');
        valorInput.value = (report.valor || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Ajustar rótulo do botão para indicar modo de edição
        const submitButton = reportForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-save"></i><span>SALVAR ALTERAÇÕES</span>';
            submitButton.classList.remove('btn-success');
            submitButton.classList.add('btn-primary');
        }

        showToast('Editando passagem selecionada. Altere os dados e clique em "Salvar alterações".', 'info');
    };

    function resetReportFormToCreateMode() {
        editingIndex = null;
        const submitButton = reportForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-plus-circle"></i><span>ADICIONAR PASSAGEM</span>';
            submitButton.classList.remove('btn-primary');
            submitButton.classList.add('btn-success');
        }
    }

    function rebuildReportTable() {
        reportTableBody.innerHTML = '';

        if (reports.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-row';
            emptyRow.innerHTML = `
                <td colspan="10">
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Nenhuma passagem registrada ainda</p>
                        <small>Adicione sua primeira passagem usando o formulário acima</small>
                    </div>
                </td>
            `;
            reportTableBody.appendChild(emptyRow);
            return;
        }

        reports.forEach(r => addReportToTable(r));
    }

    function clearAllReports() {
        if (reports.length === 0) {
            showToast('Não há passagens para limpar.', 'info');
            return;
        }

        if (confirm('Tem certeza que deseja remover TODAS as passagens?')) {
            reports = [];
            reportTableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="10">
                        <div class="empty-state">
                            <i class="fas fa-clipboard-list"></i>
                            <p>Nenhuma passagem registrada ainda</p>
                            <small>Adicione sua primeira passagem usando o formulário acima</small>
                        </div>
                    </td>
                </tr>
            `;

            updateTotals();
            updateResumo();
            showToast('Todas as passagens foram removidas!');
        }
    }

    // ===== NAVEGAÇÃO ENTRE ETAPAS =====
    function voltarParaEtapa1() {
        etapa2.style.display = 'none';
        etapa1.style.display = 'block';
        currentStep.textContent = 'Etapa 1 de 2';
    }

    // ===== TOAST NOTIFICATIONS =====
    function showToast(message, type = 'success') {
        const toastIcon = toast.querySelector('.toast-content i');
        const toastMessage = toast.querySelector('.toast-message');

        // Configurar cor baseada no tipo
        if (type === 'success') {
            toast.style.background = 'linear-gradient(135deg, #27ae60, #219653)';
            toastIcon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            toast.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            toastIcon.className = 'fas fa-exclamation-circle';
        } else if (type === 'warning') {
            toast.style.background = 'linear-gradient(135deg, #f39c12, #d68910)';
            toastIcon.className = 'fas fa-exclamation-triangle';
        } else if (type === 'info') {
            toast.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
            toastIcon.className = 'fas fa-info-circle';
        }

        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    // ===== EXPORTAÇÃO PDF =====
    function exportToPDF() {
        if (reports.length === 0) {
            showToast('Não há passagens para exportar.', 'warning');
            return;
        }

        if (!colaboradorData.nomeCompleto) {
            showToast('Complete os dados do colaborador primeiro.', 'error');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Página 1: Logo e dados do colaborador
            const logoImg = document.getElementById('logoPdfSource');
            if (logoImg && logoImg.complete) {
                try {
                    doc.addImage(logoImg, 'PNG', 15, 10, 30, 15);
                } catch (e) {
                    console.warn('Não foi possível incluir o logo no PDF:', e);
                }
            }

            doc.setFontSize(16);
            doc.text("RELATÓRIO DE PASSAGEM", 105, 20, { align: 'center' });

            doc.setFontSize(10);
            let yPosition = 30;

            const colaboradorFields = [
                `NOME: ${colaboradorData.nomeCompleto}`,
                `ENDEREÇO: ${colaboradorData.endereco}`,
                `BAIRRO: ${colaboradorData.bairro}`,
                `CIDADE: ${colaboradorData.cidade}`,
                `TELEFONE: ${colaboradorData.telefone}`,
                `DATA DE ENVIO: ${formatDate(colaboradorData.dataEnvio)}`,
                `TIPO DE RELATÓRIO: ${colaboradorData.tipoRelatorio}`,
                colaboradorData.tipoRelatorio === 'REEMBOLSO' && colaboradorData.periodoReembolso
                    ? `PERÍODO DO REEMBOLSO: ${formatDate(colaboradorData.periodoReembolso.dataInicio)} até ${formatDate(colaboradorData.periodoReembolso.dataFim)}`
                    : null,
                `EQUIPE: ${colaboradorData.equipe}`
            ].filter(Boolean);

            colaboradorFields.forEach(field => {
                doc.text(field, 14, yPosition);
                yPosition += 10;
            });

            yPosition += 10;

            // Termo de Autorização
            doc.setFontSize(12);
            doc.text("TERMO DE AUTORIZAÇÃO", 105, yPosition, { align: 'center' });
            yPosition += 10;

            doc.setFontSize(10);
            const autorizacaoText = [
                `Eu, ${colaboradorData.nomeCompleto}, residente no endereço ${colaboradorData.endereco}, `,
                `${colaboradorData.bairro}, ${colaboradorData.cidade}, DECLARO que todas as informações apresentadas `,
                "neste Relatório de Passagem foram por mim fornecidas de forma verdadeira, completa e correspondente ",
                "ao meu efetivo deslocamento entre a residência e o local de trabalho, e vice-versa.",
                "Reconheço que é de minha exclusiva responsabilidade o correto preenchimento deste documento, ",
                "incluindo, as integrações tarifárias utilizadas, quando aplicável.",
                "Estou ciente de que qualquer informação incorreta, omissão, adulteração ou preenchimento que resulte ",
                "em vantagem indevida ou prejuízo à empresa poderá caracterizar falta disciplinar, sujeitando-me às ",
                "medidas previstas na Consolidação das Leis do Trabalho (CLT), bem como nas normas internas da empresa."
            ];

            doc.text(autorizacaoText, 15, yPosition, { maxWidth: 180, align: 'justify' });

            // Assinatura - layout centralizado e mais limpo
            yPosition += 70;
            const linhaY = yPosition + 20;

            // Linha de assinatura centralizada
            const linhaLargura = 80;
            const linhaXInicio = 105 - linhaLargura / 2;
            const linhaXFim = 105 + linhaLargura / 2;

            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(linhaXInicio, linhaY, linhaXFim, linhaY);

            // Assinatura (imagem) um pouco acima da linha
            if (colaboradorData.assinaturaColaborador && colaboradorData.assinaturaColaborador !== 'data:,') {
                try {
                    doc.addImage(
                        colaboradorData.assinaturaColaborador,
                        'PNG',
                        linhaXInicio,
                        linhaY - 18,
                        linhaLargura,
                        18
                    );
                } catch (error) {
                    console.log('Não foi possível incluir assinatura no PDF');
                }
            }

            // Legenda abaixo da linha
            doc.setFontSize(9);
            doc.text("ASSINATURA DO FUNCIONÁRIO", 105, linhaY + 6, { align: 'center' });

            // Página 2: Passagens detalhadas
            doc.addPage();
            doc.setFontSize(16);
            doc.text("PASSAGENS REGISTRADAS", 105, 20, { align: 'center' });

            // Montar corpo da tabela com as passagens + linha de média por passagem
            const totalGeralPassagens = reports.reduce((sum, r) => sum + r.valor, 0);
            const mediaPorPassagem = reports.length > 0 ? totalGeralPassagens / reports.length : 0;

            const tabelaPassagens = reports.map(report => [
                report.dataVisita,
                report.ida,
                report.destino,
                report.bilhetagem,
                report.modal,
                report.numeroLinha || '-',
                report.tipoLinha || '-',
                'R$ ' + report.valor.toFixed(2),
                report.integracao || 'NÃO'
            ]);

            // Linha final de resumo: média por passagem
            tabelaPassagens.push([
                'MÉDIA POR PASSAGEM',
                '',
                '',
                '',
                '',
                '',
                '',
                'R$ ' + mediaPorPassagem.toFixed(2),
                ''
            ]);

            doc.autoTable({
                startY: 30,
                head: [[
                    'DIA',
                    'ORIGEM',
                    'DESTINO',
                    'BILHETAGEM',
                    'MODAL',
                    'Nº LINHA',
                    'TIPO DE LINHA',
                    'VALOR',
                    'INTEGRAÇÃO'
                ]],
                body: tabelaPassagens,
                margin: { horizontal: 15 },
                styles: { fontSize: 8, cellPadding: 3 },
                headerStyles: { fillColor: [44, 62, 80], textColor: 255 }
            });

            // Página 3: Resumo
            doc.addPage();
            const total = reports.reduce((sum, r) => sum + r.valor, 0);
            const dias = new Set(reports.map(r => r.dataVisita)).size;
            const media = dias > 0 ? total / dias : 0;

            doc.setFontSize(16);
            doc.text("RESUMO FINANCEIRO", 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Total de Passagens: ${reports.length}`, 20, 40);
            doc.text(`Total Gasto: R$ ${total.toFixed(2)}`, 20, 50);
            doc.text(`Dias com Registro: ${dias}`, 20, 60);
            doc.text(`Média Diária (R$/dia): R$ ${media.toFixed(2)}`, 20, 70);

            // Médias por tipo de bilhetagem
            const statsBilhetagem = {};
            reports.forEach(r => {
                const key = r.bilhetagem;
                if (!statsBilhetagem[key]) {
                    statsBilhetagem[key] = { total: 0, count: 0 };
                }
                statsBilhetagem[key].total += r.valor;
                statsBilhetagem[key].count += 1;
            });

            doc.setFontSize(14);
            doc.text("MÉDIA POR TIPO DE BILHETAGEM", 105, 90, { align: 'center' });

            let yPos = 100;
            doc.setFontSize(10);
            Object.entries(statsBilhetagem).forEach(([tipo, info]) => {
                const mediaTipo = info.total / info.count;
                doc.text(`${tipo}: R$ ${mediaTipo.toFixed(2)}`, 20, yPos);
                yPos += 8;
            });

            // Médias por dia da semana
            const statsDia = {};
            reports.forEach(r => {
                const diaSemana = r.dataVisita;
                if (!statsDia[diaSemana]) {
                    statsDia[diaSemana] = { total: 0, count: 0 };
                }
                statsDia[diaSemana].total += r.valor;
                statsDia[diaSemana].count += 1;
            });

            yPos += 8;
            doc.setFontSize(14);
            doc.text("MÉDIA POR DIA DA SEMANA", 105, yPos, { align: 'center' });
            yPos += 10;

            doc.setFontSize(10);
            Object.entries(statsDia).forEach(([diaSemana, info]) => {
                const mediaDia = info.total / info.count;
                doc.text(`${diaSemana}: R$ ${mediaDia.toFixed(2)}`, 20, yPos);
                yPos += 8;
            });

            doc.save(`Relatorio_Passagem_${colaboradorData.nomeCompleto.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

            showToast('PDF exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            showToast('Erro ao exportar PDF. Por favor, tente novamente.', 'error');
        }
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // ===== INICIALIZAR APLICAÇÃO =====
    init();
});
