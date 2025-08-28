// JavaScript para a página inicial das fichas de catequese

document.addEventListener('DOMContentLoaded', function() {
  // Adiciona efeitos de hover aos cards das fichas
  const fichaCards = document.querySelectorAll('.bg-gradient-to-br');
  
  fichaCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Adiciona um efeito de clique nos botões
  const botoesFichas = document.querySelectorAll('a[href*="ficha-"]');
  
  botoesFichas.forEach(botao => {
    botao.addEventListener('click', function(e) {
      // Adiciona uma pequena animação de feedback
      this.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 100);
    });
  });

  // Console log para debug
  console.log('Sistema de Fichas de Catequese carregado com sucesso!');
});