class Transacao {
    constructor(descricao, valor, tipo) {
        this.descricao = descricao;
        this.valor = parseFloat(valor);
        this.tipo = tipo; // 'R' para receita, 'D' para despesa
        this.id = Date.now().toString();
    }
}

class FinancasApp {
    constructor() {
        this.transacoes = this.carregarTransacoes();
        this.filtroAtual = 'todos';
        
        this.initElements();
        this.renderTransacoes();
        this.atualizarSaldo();
        this.initEventListeners();
    }
    
    initElements() {
        this.form = document.getElementById('transacao-form');
        this.descricaoInput = document.getElementById('descricao');
        this.valorInput = document.getElementById('valor');
        this.tipoInputs = document.querySelectorAll('input[name="tipo"]');
        this.transacoesLista = document.getElementById('transacoes-lista');
        this.saldoAtualElement = document.getElementById('saldo-atual');
        this.filtroBtns = document.querySelectorAll('.filtro-btn');
    }
    
    initEventListeners() {
        this.form.addEventListener('submit', (e) => this.adicionarTransacao(e));
        
        this.filtroBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filtroBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filtroAtual = btn.dataset.filtro;
                this.renderTransacoes();
            });
        });
    }
    
    adicionarTransacao(e) {
        e.preventDefault();
        
        const descricao = this.descricaoInput.value.trim();
        const valor = this.valorInput.value;
        const tipo = document.querySelector('input[name="tipo"]:checked').value;
        
        if (!descricao || !valor) return;
        
        const transacao = new Transacao(descricao, valor, tipo);
        this.transacoes.push(transacao);
        this.salvarTransacoes();
        
        this.descricaoInput.value = '';
        this.valorInput.value = '';
        
        this.renderTransacoes();
        this.atualizarSaldo();
    }
    
    removerTransacao(id) {
        this.transacoes = this.transacoes.filter(t => t.id !== id);
        this.salvarTransacoes();
        this.renderTransacoes();
        this.atualizarSaldo();
    }
    
    renderTransacoes() {
        this.transacoesLista.innerHTML = '';
        
        const transacoesFiltradas = this.transacoes.filter(t => {
            if (this.filtroAtual === 'todos') return true;
            return t.tipo === this.filtroAtual;
        });
        
        if (transacoesFiltradas.length === 0) {
            this.transacoesLista.innerHTML = '<li class="sem-transacoes">Nenhuma transação encontrada</li>';
            return;
        }
        
        transacoesFiltradas.forEach(transacao => {
            const li = document.createElement('li');
            
            li.innerHTML = `
                <span class="transacao-descricao">${transacao.descricao}</span>
                <span class="transacao-valor ${transacao.tipo === 'R' ? 'receita-valor' : 'despesa-valor'}">
                    ${transacao.tipo === 'R' ? '+' : '-'} R$ ${transacao.valor.toFixed(2)}
                </span>
                <button class="delete-btn" data-id="${transacao.id}">Excluir</button>
            `;
            
            this.transacoesLista.appendChild(li);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removerTransacao(btn.dataset.id);
            });
        });
    }
    
    atualizarSaldo() {
        const saldo = this.transacoes.reduce((total, transacao) => {
            return transacao.tipo === 'R' 
                ? total + transacao.valor 
                : total - transacao.valor;
        }, 0);
        
        this.saldoAtualElement.textContent = saldo.toFixed(2);
        this.saldoAtualElement.style.color = saldo >= 0 ? 'var(--receita-color)' : 'var(--despesa-color)';
    }
    
    salvarTransacoes() {
        localStorage.setItem('transacoes', JSON.stringify(this.transacoes));
    }
    
    carregarTransacoes() {
        const dados = localStorage.getItem('transacoes');
        return dados ? JSON.parse(dados) : [];
    }
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    new FinancasApp();
});