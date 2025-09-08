// Sistema de Aviso de Privacidade
class AvisoPrivacidade {
    constructor() {
        this.chaveLocalStorage = 'aviso_privacidade_confirmado';
        this.diasValidade = 7;
        this.init();
    }

    init() {
        // Verificar se precisa mostrar o aviso
        if (this.deveExibirAviso()) {
            this.mostrarAviso();
        }
    }

    deveExibirAviso() {
        try {
            const dadosSalvos = localStorage.getItem(this.chaveLocalStorage);
            if (!dadosSalvos) {
                return true; // Primeira vez
            }

            const { dataConfirmacao } = JSON.parse(dadosSalvos);
            const agora = new Date().getTime();
            const dataAnterior = new Date(dataConfirmacao).getTime();
            const diferencaDias = (agora - dataAnterior) / (1000 * 60 * 60 * 24);

            return diferencaDias >= this.diasValidade;
        } catch (error) {
            console.error('Erro ao verificar aviso de privacidade:', error);
            return true; // Em caso de erro, mostrar o aviso
        }
    }

    mostrarAviso() {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.id = 'aviso-privacidade-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-lg shadow-xl max-w-md w-full p-6';
        
        modal.innerHTML = `
            <div class="text-center mb-4">
                <div class="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">🔒 Aviso de Privacidade</h3>
            </div>
            
            <div class="text-sm text-gray-700 space-y-3 mb-6">
                <p class="font-medium text-center">Este site <strong>NÃO coleta nem envia</strong> nenhum dos dados que você preencher.</p>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 class="font-medium text-blue-900 mb-2">✅ Como seus dados são protegidos:</h4>
                    <ul class="text-blue-800 space-y-1 text-xs">
                        <li>• Todos os dados ficam apenas no seu navegador</li>
                        <li>• Nada é enviado para servidores externos</li>
                        <li>• Só você tem acesso aos dados digitados</li>
                        <li>• Os dados são acessíveis apenas via PDF gerado</li>
                    </ul>
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 class="font-medium text-green-900 mb-2">📋 Para usar o site:</h4>
                    <ul class="text-green-800 space-y-1 text-xs">
                        <li>• Preencha a ficha normalmente</li>
                        <li>• Gere o PDF com os dados</li>
                        <li>• Envie o PDF para o responsável</li>
                        <li>• Seus dados permanecem privados</li>
                    </ul>
                </div>
                
            </div>
            
            <div class="flex space-x-3">
                <button id="btn-entendi-privacidade" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Entendi e Concordo
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Adicionar event listener
        document.getElementById('btn-entendi-privacidade').addEventListener('click', () => {
            this.confirmarAviso();
            this.fecharAviso();
        });
        
        // Prevenir fechamento clicando fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                // Não permitir fechar clicando fora - usuário deve confirmar
                return;
            }
        });
    }

    confirmarAviso() {
        try {
            const dados = {
                dataConfirmacao: new Date().toISOString(),
                versao: '1.0'
            };
            localStorage.setItem(this.chaveLocalStorage, JSON.stringify(dados));
        } catch (error) {
            console.error('Erro ao salvar confirmação do aviso:', error);
        }
    }

    fecharAviso() {
        const overlay = document.getElementById('aviso-privacidade-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Inicializar automaticamente quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AvisoPrivacidade();
});
