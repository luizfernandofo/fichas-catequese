// Gerenciador de dados dos catequizandos
class GerenciadorDados {
    constructor() {
        this.catequizandos = [];
        this.catequizandoEditando = null;
        this.init();
    }

    init() {
        this.carregarDadosLocalStorage();
        this.setupEventListeners();
        this.renderizarCatequizandos();
        // Sempre mostrar a seção de catequizandos
        document.getElementById('catequizandos-section').classList.remove('hidden');
    }

    setupEventListeners() {
        // Upload de arquivo
        const uploadInput = document.getElementById('json-upload');
        uploadInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Busca
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', () => this.filtrarCatequizandos());

        // Filtro por tipo
        const tipoFilter = document.getElementById('tipo-filter');
        tipoFilter.addEventListener('change', () => this.filtrarCatequizandos());

        // Botões
        document.getElementById('btn-limpar-dados').addEventListener('click', () => this.confirmarLimpeza());
        document.getElementById('btn-baixar-template').addEventListener('click', () => this.baixarTemplate());
        document.getElementById('btn-baixar-dados').addEventListener('click', () => this.baixarDados());
        document.getElementById('btn-adicionar-catequizando').addEventListener('click', () => this.adicionarCatequizando());
        document.getElementById('btn-mostrar-upload').addEventListener('click', () => this.toggleUploadSection());
        document.getElementById('btn-fechar-upload').addEventListener('click', () => this.toggleUploadSection());

        // Modal
        document.getElementById('modal-cancelar').addEventListener('click', () => this.fecharModal());
        document.getElementById('modal-confirmar').addEventListener('click', () => this.executarAcaoConfirmada());

        // Modal de edição
        document.getElementById('modal-edicao-fechar').addEventListener('click', () => this.fecharModalEdicao());
        document.getElementById('modal-edicao-cancelar').addEventListener('click', () => this.fecharModalEdicao());
        document.getElementById('form-edicao').addEventListener('submit', (e) => this.salvarEdicao(e));

        // Controle de campos específicos por tipo
        const tipoSelect = document.querySelector('#form-edicao [name="tipo"]');
        tipoSelect.addEventListener('change', () => this.toggleCamposCrisma());

        // Configurar máscaras e validações
        this.setupMasksAndValidations();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            alert('Por favor, selecione um arquivo JSON válido.');
            // Limpar o input para permitir nova seleção
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dados = JSON.parse(e.target.result);
                this.processarDadosJSON(dados);
            } catch (error) {
                alert('Erro ao ler o arquivo JSON. Verifique se o formato está correto.');
                console.error('Erro ao processar JSON:', error);
                // Limpar o input em caso de erro
                event.target.value = '';
            }
        };
        reader.onerror = () => {
            alert('Erro ao ler o arquivo.');
            // Limpar o input em caso de erro
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    processarDadosJSON(dados) {
        if (!Array.isArray(dados)) {
            alert('O arquivo JSON deve conter um array de catequizandos.');
            return;
        }

        // Validar estrutura básica
        const dadosValidos = dados.filter(item => item.nome_catequizando);
        
        if (dadosValidos.length === 0) {
            alert('Nenhum catequizando válido encontrado no arquivo.');
            return;
        }

        // Adicionar IDs únicos se não existirem
        dadosValidos.forEach((catequizando, index) => {
            if (!catequizando.id) {
                catequizando.id = Date.now() + index;
            }
            // Detectar tipo baseado nos campos presentes
            if (!catequizando.tipo) {
                catequizando.tipo = this.detectarTipo(catequizando);
            }
        });

        // Substituir todos os dados existentes pelos novos dados
        this.catequizandos = dadosValidos;
        this.salvarNoLocalStorage();
        this.limparFiltros();
        this.renderizarCatequizandos();
        
        // Fechar seção de upload após sucesso
        this.toggleUploadSection();
        
        // Limpar o input de arquivo para permitir reenvio do mesmo arquivo
        document.getElementById('json-upload').value = '';
        
        // Mostrar notificação de sucesso
        this.mostrarNotificacao(`${dadosValidos.length} catequizando(s) carregado(s) com sucesso!`, 'success');
        
        console.log('Dados processados com sucesso:', this.catequizandos.length, 'catequizandos');
    }

    detectarTipo(catequizando) {
        // Se tem campos específicos da crisma
        if (catequizando.padrinho || catequizando.madrinha || catequizando.primeira_eucaristia) {
            return 'crisma';
        }
        // Se tem campos específicos da eucaristia
        if (catequizando.nome_responsavel || catequizando.profissao_responsavel) {
            return 'eucaristia';
        }
        // Default para crisma se não conseguir detectar
        return 'crisma';
    }

    mostrarStatusUpload(count) {
        const statusDiv = document.getElementById('upload-status');
        const countSpan = document.getElementById('upload-count');
        countSpan.textContent = count;
        statusDiv.classList.remove('hidden');
        
        // Mostrar seção de catequizandos
        document.getElementById('catequizandos-section').classList.remove('hidden');
    }

    filtrarCatequizandos() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const tipoFilter = document.getElementById('tipo-filter').value;
        
        let catequizandosFiltrados = this.catequizandos;

        // Filtrar por busca
        if (searchTerm) {
            catequizandosFiltrados = catequizandosFiltrados.filter(c => 
                c.nome_catequizando.toLowerCase().includes(searchTerm)
            );
        }

        // Filtrar por tipo
        if (tipoFilter !== 'todos') {
            catequizandosFiltrados = catequizandosFiltrados.filter(c => c.tipo === tipoFilter);
        }

        this.renderizarCatequizandos(catequizandosFiltrados);
    }

    limparFiltros() {
        document.getElementById('search-input').value = '';
        document.getElementById('tipo-filter').value = 'todos';
    }

    renderizarCatequizandos(lista = null) {
        const grid = document.getElementById('catequizandos-grid');
        const catequizandos = lista || this.catequizandos;

        if (catequizandos.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500">Nenhum catequizando encontrado.</p>';
            return;
        }

        grid.innerHTML = catequizandos.map(catequizando => this.criarCardCatequizando(catequizando)).join('');
    }

    criarCardCatequizando(catequizando) {
        const tipoIcon = catequizando.tipo === 'crisma' ? '✝️' : '🍞';
        const tipoText = catequizando.tipo === 'crisma' ? 'Crisma' : 'Primeira Eucaristia';
        const corBadge = catequizando.tipo === 'crisma' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
        const corBotao = catequizando.tipo === 'crisma' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600';

        // Função para criar link do WhatsApp
        const criarLinkWhatsApp = (numero) => {
            if (!numero) return '';
            const numeroLimpo = numero.replace(/[^\d]/g, '');
            return `<a href="http://wa.me/55${numeroLimpo}" target="_blank" class="text-green-600 hover:text-green-800">${numero}</a>`;
        };

        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div class="flex items-center justify-between mb-3">
                    <span class="${corBadge} text-xs font-medium px-2.5 py-0.5 rounded">
                        ${tipoIcon} ${tipoText}
                    </span>
                    <button onclick="gerenciador.removerCatequizando(${catequizando.id})" 
                            class="text-red-500 hover:text-red-700 text-sm" title="Remover">
                        🗑️
                    </button>
                </div>
                
                <h3 class="font-semibold text-gray-800 mb-2">${catequizando.nome_catequizando}</h3>
                
                <div class="text-sm text-gray-600 space-y-1 mb-4 flex-grow">
                    ${catequizando.data_nascimento ? `<p>📅 ${this.formatarData(catequizando.data_nascimento)}</p>` : ''}
                    ${catequizando.celular ? `<p>📱 ${criarLinkWhatsApp(catequizando.celular)}</p>` : ''}
                    ${catequizando.cel_pai ? `<p>👨🏻 ${criarLinkWhatsApp(catequizando.cel_pai)} ${catequizando.nome_pai ? `(${catequizando.nome_pai.split(' ')[0]})` : ''}</p>` : ''}
                    ${catequizando.cel_mae ? `<p>👩 ${criarLinkWhatsApp(catequizando.cel_mae)} ${catequizando.nome_mae ? `(${catequizando.nome_mae.split(' ')[0]})` : ''}</p>` : ''}
                    ${catequizando.endereco ? `<p>📍 ${catequizando.endereco.substring(0, 30)}${catequizando.endereco.length > 30 ? '...' : ''}</p>` : ''}
                </div>
                
                <div class="space-y-2 mt-auto">
                    <button onclick="gerenciador.preencherFormulario(${catequizando.id})" 
                            class="w-full ${corBotao} text-white px-3 py-2 rounded text-sm transition-colors">
                        📝 Preencher Formulário
                    </button>
                    <button onclick="gerenciador.editarCatequizando(${catequizando.id})" 
                            class="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors">
                        ✏️ Editar Dados
                    </button>
                </div>
            </div>
        `;
    }

    formatarData(data) {
        if (!data) return '';
        try {
            return new Date(data).toLocaleDateString('pt-BR');
        } catch {
            return data;
        }
    }

    preencherFormulario(id) {
        const catequizando = this.catequizandos.find(c => c.id === id);
        if (!catequizando) return;

        // Salvar dados do catequizando selecionado no localStorage
        localStorage.setItem('catequizando_selecionado', JSON.stringify(catequizando));

        // Redirecionar para a página apropriada
        const pagina = catequizando.tipo === 'crisma' ? 'ficha-crisma.html' : 'ficha-primeira-eucaristia.html';
        window.location.href = `${pagina}?preenchimento=auto`;
    }

    editarCatequizando(id) {
        const catequizando = this.catequizandos.find(c => c.id === id);
        if (!catequizando) return;

        this.catequizandoEditando = catequizando;
        document.getElementById('modal-edicao-titulo').textContent = 'Editar Catequizando';
        this.preencherFormularioEdicao(catequizando);
        this.setupMasksAndValidations();
        this.toggleCamposCrisma();
        this.mostrarModalEdicao();
    }

    adicionarCatequizando() {
        // Criar um catequizando vazio
        const novoCatequizando = {
            id: Date.now(),
            tipo: 'crisma',
            nome_catequizando: '',
            data_nascimento: '',
            naturalidade: '',
            nacionalidade: 'Brasileira',
            ano_escolar: '',
            horario: '',
            escola: '',
            endereco: '',
            cpf: '',
            celular: '',
            batizado: 'Sim',
            paroquia_batismo: '',
            data_batismo: '',
            primeira_eucaristia: 'Sim',
            paroquia_eucaristia: '',
            data_eucaristia: '',
            nome_pai: '',
            cel_pai: '',
            email_pai: '',
            nome_mae: '',
            cel_mae: '',
            email_mae: '',
            igreja: '',
            dia_semana: '',
            horario_turma: '',
            catequista: '',
            padrinho: '',
            madrinha: ''
        };

        this.catequizandoEditando = novoCatequizando;
        document.getElementById('modal-edicao-titulo').textContent = 'Adicionar Catequizando';
        this.preencherFormularioEdicao(novoCatequizando);
        this.setupMasksAndValidations();
        this.toggleCamposCrisma();
        this.mostrarModalEdicao();
    }

    removerCatequizando(id) {
        const catequizando = this.catequizandos.find(c => c.id === id);
        if (!catequizando) return;

        this.acaoConfirmacao = () => {
            this.catequizandos = this.catequizandos.filter(c => c.id !== id);
            this.salvarNoLocalStorage();
            this.renderizarCatequizandos();
        };

        this.mostrarModal(`Tem certeza que deseja remover "${catequizando.nome_catequizando}"?`);
    }

    confirmarLimpeza() {
        if (this.catequizandos.length === 0) {
            alert('Não há dados para limpar.');
            return;
        }

        this.acaoConfirmacao = () => {
            console.log('Limpando dados...', this.catequizandos.length, 'catequizandos');
            this.catequizandos = [];
            this.salvarNoLocalStorage();
            this.limparFiltros();
            // Não mostrar/ocultar status de upload - não é necessário
            // Não ocultar catequizandos-section para manter o botão "adicionar" disponível
            // document.getElementById('catequizandos-section').classList.add('hidden');
            // Limpar o input de arquivo para permitir novo upload
            document.getElementById('json-upload').value = '';
            this.renderizarCatequizandos();
            console.log('Dados limpos com sucesso');
        };

        this.mostrarModal('Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.');
    }

    mostrarModal(texto) {
        document.getElementById('modal-texto').textContent = texto;
        document.getElementById('modal-confirmacao').classList.remove('hidden');
        document.getElementById('modal-confirmacao').classList.add('flex');
    }

    fecharModal() {
        document.getElementById('modal-confirmacao').classList.add('hidden');
        document.getElementById('modal-confirmacao').classList.remove('flex');
    }

    executarAcaoConfirmada() {
        if (this.acaoConfirmacao) {
            this.acaoConfirmacao();
            this.acaoConfirmacao = null;
        }
        this.fecharModal();
    }

    baixarTemplate() {
        const template = [
            {
                "tipo": "crisma",
                "nome_catequizando": "João Silva Santos",
                "data_nascimento": "2008-05-15",
                "naturalidade": "Goiânia",
                "nacionalidade": "Brasileira",
                "ano_escolar": "9º ano",
                "horario": "Matutino",
                "escola": "Escola Estadual Dom Pedro II",
                "endereco": "Rua das Flores, 123, Jardim América, Goiânia - GO",
                "cpf": "123.456.789-00",
                "celular": "(62) 99999-9999",
                "batizado": "Sim",
                "paroquia_batismo": "Paróquia Sant'Ana",
                "data_batismo": "2008-08-20",
                "primeira_eucaristia": "Sim",
                "paroquia_eucaristia": "Paróquia Sant'Ana",
                "data_eucaristia": "2016-10-15",
                "nome_pai": "José Silva Santos",
                "cel_pai": "(62) 98888-8888",
                "email_pai": "jose@email.com",
                "nome_mae": "Maria Silva Santos",
                "cel_mae": "(62) 97777-7777",
                "email_mae": "maria@email.com",
                "igreja": "Igreja Sant'Ana",
                "dia_semana": "Domingo",
                "horario_turma": "14:00",
                "catequista": "Ana Costa",
                "padrinho": "Pedro Santos",
                "madrinha": "Lúcia Santos"
            },
            {
                "tipo": "eucaristia",
                "nome_catequizando": "Ana Paula Costa",
                "data_nascimento": "2015-03-10",
                "naturalidade": "Goiânia",
                "nacionalidade": "Brasileira",
                "endereco": "Av. Principal, 456, Centro, Goiânia - GO",
                "nome_pai": "Carlos Costa",
                "nome_mae": "Sandra Costa",
                "nome_responsavel": "Sandra Costa",
                "cel_responsavel": "(62) 96666-6666",
                "email_responsavel": "sandra@email.com",
                "profissao_responsavel": "Professora",
                "batizado": "Sim",
                "paroquia_batismo": "Paróquia Sant'Ana",
                "data_batismo": "2015-06-15",
                "escola": "Escola Municipal Pequeno Príncipe",
                "ano_serie": "3º ano",
                "igreja": "Igreja Sant'Ana",
                "dia_semana": "Sábado",
                "horario_turma": "15:00",
                "catequista": "Márcia Silva"
            }
        ];

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "template-catequizandos.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    baixarDados() {
        if (this.catequizandos.length === 0) {
            alert('Não há dados para baixar. Carregue alguns catequizandos primeiro.');
            return;
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.catequizandos, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "catequizandos-dados.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    toggleUploadSection() {
        const uploadSection = document.getElementById('upload-section');
        const uploadToggle = document.getElementById('upload-toggle');
        const btnMostrarUpload = document.getElementById('btn-mostrar-upload');
        
        if (uploadSection.classList.contains('hidden')) {
            // Mostrar seção de upload
            uploadSection.classList.remove('hidden');
            uploadToggle.classList.add('hidden');
        } else {
            // Ocultar seção de upload
            uploadSection.classList.add('hidden');
            uploadToggle.classList.remove('hidden');
            btnMostrarUpload.innerHTML = '📁 Fazer Upload de Dados';
        }
    }

    carregarDadosLocalStorage() {
        try {
            const dados = localStorage.getItem('catequizandos_dados');
            if (dados) {
                this.catequizandos = JSON.parse(dados);
                console.log('Dados carregados do localStorage:', this.catequizandos.length, 'catequizandos');
                // Não mostrar status de upload ao carregar do localStorage
            } else {
                console.log('Nenhum dado encontrado no localStorage');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do localStorage:', error);
            this.catequizandos = [];
        }
    }

    salvarNoLocalStorage() {
        try {
            localStorage.setItem('catequizandos_dados', JSON.stringify(this.catequizandos));
        } catch (error) {
            console.error('Erro ao salvar dados no localStorage:', error);
        }
    }

    // Métodos do modal de edição
    mostrarModalEdicao() {
        document.getElementById('modal-edicao').classList.remove('hidden');
        document.getElementById('modal-edicao').classList.add('flex');
    }

    fecharModalEdicao() {
        // Limpar mensagens de erro
        const form = document.getElementById('form-edicao');
        const errorMessages = form.querySelectorAll('.error-msg');
        errorMessages.forEach(msg => msg.remove());
        
        // Remover classes de erro dos campos
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('border-red-500');
            input.classList.add('border-gray-300');
        });
        
        document.getElementById('modal-edicao').classList.add('hidden');
        document.getElementById('modal-edicao').classList.remove('flex');
        this.catequizandoEditando = null;
    }

    preencherFormularioEdicao(catequizando) {
        const form = document.getElementById('form-edicao');
        
        // Preencher todos os campos
        Object.keys(catequizando).forEach(campo => {
            const input = form.querySelector(`[name="${campo}"]`);
            if (input && catequizando[campo] !== undefined) {
                input.value = catequizando[campo] || '';
            }
        });
    }

    toggleCamposCrisma() {
        const tipoSelect = document.querySelector('#form-edicao [name="tipo"]');
        const camposCrisma = document.getElementById('campos-crisma');
        
        if (tipoSelect.value === 'crisma') {
            camposCrisma.style.display = 'block';
        } else {
            camposCrisma.style.display = 'none';
        }
    }

    setupMasksAndValidations() {
        // Limpar máscaras existentes
        this.clearMasks();
        
        // Configurar máscaras
        const cpfInput = document.querySelector('#form-edicao [name="cpf"]');
        const celularInput = document.querySelector('#form-edicao [name="celular"]');
        const celPaiInput = document.querySelector('#form-edicao [name="cel_pai"]');
        const celMaeInput = document.querySelector('#form-edicao [name="cel_mae"]');
        const horarioTurmaInput = document.querySelector('#form-edicao [name="horario_turma"]');

        // Aplicar máscaras
        if (cpfInput) {
            this.cpfMask = IMask(cpfInput, { mask: '000.000.000-00' });
        }
        if (celularInput) {
            this.celularMask = IMask(celularInput, { mask: '(00) 00000-0000' });
        }
        if (celPaiInput) {
            this.celPaiMask = IMask(celPaiInput, { mask: '(00) 00000-0000' });
        }
        if (celMaeInput) {
            this.celMaeMask = IMask(celMaeInput, { mask: '(00) 00000-0000' });
        }
        if (horarioTurmaInput) {
            this.horarioTurmaMask = IMask(horarioTurmaInput, { mask: '00:00' });
        }

        // Configurar validações
        this.setupCPFValidation();
        this.setupPhoneValidations();
    }

    clearMasks() {
        if (this.cpfMask) this.cpfMask.destroy();
        if (this.celularMask) this.celularMask.destroy();
        if (this.celPaiMask) this.celPaiMask.destroy();
        if (this.celMaeMask) this.celMaeMask.destroy();
        if (this.horarioTurmaMask) this.horarioTurmaMask.destroy();
    }

    setupCPFValidation() {
        const cpfInput = document.querySelector('#form-edicao [name="cpf"]');
        if (!cpfInput) return;

        cpfInput.addEventListener('blur', function() {
            const cpfValue = this.value;
            if (cpfValue && !isValidCPF(cpfValue)) {
                this.classList.add('border-red-500');
                this.classList.remove('border-gray-300');
                // Adiciona mensagem de erro se não existir
                let errorMsg = this.parentNode.querySelector('.error-msg');
                if (!errorMsg) {
                    errorMsg = document.createElement('span');
                    errorMsg.className = 'error-msg text-red-500 text-sm';
                    errorMsg.textContent = 'CPF inválido';
                    this.parentNode.appendChild(errorMsg);
                }
            } else {
                this.classList.remove('border-red-500');
                this.classList.add('border-gray-300');
                // Remove mensagem de erro se existir
                const errorMsg = this.parentNode.querySelector('.error-msg');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
    }

    setupPhoneValidations() {
        const phoneInputs = [
            document.querySelector('#form-edicao [name="celular"]'),
            document.querySelector('#form-edicao [name="cel_pai"]'),
            document.querySelector('#form-edicao [name="cel_mae"]')
        ];

        phoneInputs.forEach(input => {
            if (!input) return;
            
            input.addEventListener('blur', function() {
                const phoneValue = this.value;
                if (phoneValue && !this.isValidPhone(phoneValue)) {
                    this.classList.add('border-red-500');
                    this.classList.remove('border-gray-300');
                    // Adiciona mensagem de erro se não existir
                    let errorMsg = this.parentNode.querySelector('.error-msg');
                    if (!errorMsg) {
                        errorMsg = document.createElement('span');
                        errorMsg.className = 'error-msg text-red-500 text-sm';
                        errorMsg.textContent = 'Telefone inválido';
                        this.parentNode.appendChild(errorMsg);
                    }
                } else {
                    this.classList.remove('border-red-500');
                    this.classList.add('border-gray-300');
                    // Remove mensagem de erro se existir
                    const errorMsg = this.parentNode.querySelector('.error-msg');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
            
            // Adicionar método de validação ao input
            input.isValidPhone = function(phone) {
                if (typeof phone !== 'string') return false;
                // Remove todos os caracteres não numéricos
                const cleanPhone = phone.replace(/[^\d]+/g, '');
                
                // Verifica se tem 10 ou 11 dígitos (com DDD)
                if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
                
                // Se tem 11 dígitos, o 3º dígito deve ser 9 (celular)
                if (cleanPhone.length === 11 && cleanPhone[2] !== '9') return false;
                
                // Se tem 10 dígitos, o 3º dígito não pode ser 9 (fixo)
                if (cleanPhone.length === 10 && cleanPhone[2] === '9') return false;
                
                // Verifica se não são todos os dígitos iguais
                if (!!cleanPhone.match(/(\d)\1{9,10}/)) return false;
                
                return true;
            };
        });
    }

    isValidPhone(phone) {
        if (typeof phone !== 'string') return false;
        // Remove todos os caracteres não numéricos
        const cleanPhone = phone.replace(/[^\d]+/g, '');
        
        // Verifica se tem 10 ou 11 dígitos (com DDD)
        if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
        
        // Se tem 11 dígitos, o 3º dígito deve ser 9 (celular)
        if (cleanPhone.length === 11 && cleanPhone[2] !== '9') return false;
        
        // Se tem 10 dígitos, o 3º dígito não pode ser 9 (fixo)
        if (cleanPhone.length === 10 && cleanPhone[2] === '9') return false;
        
        // Verifica se não são todos os dígitos iguais
        if (!!cleanPhone.match(/(\d)\1{9,10}/)) return false;
        
        return true;
    }

    salvarEdicao(event) {
        event.preventDefault();
        
        if (!this.catequizandoEditando) return;

        const form = document.getElementById('form-edicao');
        const formData = new FormData(form);
        
        // Validar nome obrigatório
        if (!formData.get('nome_catequizando').trim()) {
            alert('O nome do catequizando é obrigatório.');
            return;
        }

        // Validar CPF se preenchido
        const cpfValue = formData.get('cpf').trim();
        if (cpfValue && !isValidCPF(cpfValue)) {
            alert('Por favor, insira um CPF válido.');
            return;
        }

        // Validar telefones se preenchidos
        const phoneFields = ['celular', 'cel_pai', 'cel_mae'];
        for (let fieldName of phoneFields) {
            const phoneValue = formData.get(fieldName).trim();
            if (phoneValue && !this.isValidPhone(phoneValue)) {
                const fieldLabels = {
                    'celular': 'Celular do catequizando',
                    'cel_pai': 'Celular do pai',
                    'cel_mae': 'Celular da mãe'
                };
                alert(`Por favor, insira um número válido para ${fieldLabels[fieldName]}.`);
                return;
            }
        }

        // Atualizar dados do catequizando
        const dadosAtualizados = {};
        for (let [key, value] of formData.entries()) {
            dadosAtualizados[key] = value.trim();
        }

        // Manter ID original
        dadosAtualizados.id = this.catequizandoEditando.id;

        // Verificar se é um novo catequizando ou edição
        const index = this.catequizandos.findIndex(c => c.id === this.catequizandoEditando.id);
        if (index !== -1) {
            // Editar existente
            this.catequizandos[index] = dadosAtualizados;
            this.mostrarNotificacao('Catequizando atualizado com sucesso!', 'success');
        } else {
            // Adicionar novo
            this.catequizandos.push(dadosAtualizados);
            this.mostrarNotificacao('Catequizando adicionado com sucesso!', 'success');
            
            // Mostrar seção de catequizandos se estava oculta
            if (this.catequizandos.length === 1) {
                // Não mostrar status de upload para adição manual
            } else {
                // Não mostrar status de upload para adição manual
            }
        }

        this.salvarNoLocalStorage();
        this.renderizarCatequizandos();
        this.fecharModalEdicao();
    }

    mostrarNotificacao(mensagem, tipo = 'success') {
        const notification = document.createElement('div');
        const corClass = tipo === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icone = tipo === 'success' ? '✅' : '❌';
        
        notification.className = `fixed top-4 right-4 ${corClass} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${icone}</span>
                <span>${mensagem}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">✕</button>
            </div>
        `;
        document.body.appendChild(notification);

        // Remover notificação após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Inicializar o gerenciador quando a página carregar
let gerenciador;
document.addEventListener('DOMContentLoaded', () => {
    gerenciador = new GerenciadorDados();
});
