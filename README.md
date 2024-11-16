# tweetXer ptBR

### Atenção:

Todo o crédito desse script é do seu criador original [Luca Hammer](https://github.com/lucahammer/). Apenas traduzi a base do script para quem não entende inglês.

# Como usar:

Você pode usar [este script](https://github.com/arielgmelo/tweetXer-ptbr/blob/main/tweetXer.js) para excluir todos os seus Tweets. Mesmo que eles não apareçam no seu perfil. Mas você precisa da sua pasta de dados exportada do Twitter para que funcione. Como isso automatiza a exclusão, pode resultar no banimento da sua conta. Não é um resultado ruim.

1.  Use o Firefox ou Safari se possível.
2.  Entre na sua conta no Twitter.
3.  Abra o console do navegador (F12).
4.  Cole o [script completo](https://github.com/arielgmelo/tweetXer-ptbr/blob/main/tweetXer.js) no console e pressione Enter.
5.  Uma barra azul irá aparecer no topo da sua janela.
6.  Use o seletor de arquivo e selecione o arquivo tweet-headers.js ou tweets.js.
7.  Espere até que todos os tweets sejam excluídos (cerca de 5-10 Tweets por segundo).

Se o processo for interrompido a qualquer momento, você pode usar as Opções Avançadas para informar quantos Tweets foram excluídos na execução anterior, para não começar do zero novamente. O script tentará detectar automaticamente se já foi executado anteriormente, calculando a diferença entre os Tweets no arquivo e a contagem de Tweets no perfil. Se houver uma diferença, ele tentará pular automaticamente essa quantidade (+5% de margem). Se você quiser que ele comece do início, abra as 'Opções Avançadas' e insira 1 em vez de 0. Ele então pulará exatamente um Tweet e não tentará calcular uma quantidade.

# Como funciona?

Nunca use algo assim de uma fonte não confiável. O script intercepta as requisições do seu navegador para o Twitter e substitui os IDs dos Tweets pelos IDs do seu arquivo tweets.js. Isso permite que ele acesse os Tweets antigos e os exclua.

interceptação XHR inspirada por [github.com/ttodua/Tamper-Request-Javascript-Tool](https://github.com/ttodua/Tamper-Request-Javascript-Tool)

exclusão mais rápida inspirada por [github.com/Lyfhael/DeleteTweets](https://github.com/Lyfhael/DeleteTweets)

# Bônus: 

### Exporte seus Salvos:

Como os Salvos não estão incluídos na exportação de dados do Twitter, há um botão nas "Opções Avançadas" para exportá-los.

### Exclusão de Tweets sem o tweet-headers.js:

Se por algum motivo você não puder usar a exportação de dados ou ela perdeu alguns Tweets, você pode usar o modo lento nas "Opções Avançadas". Esteja avisado, ele é muito lento porque precisa carregar os Tweets no seu perfil primeiro para excluí-los, e há vários limites de requisições para isso.

### Deixar de seguir todos:

Nas "Opções Avançadas", você pode automaticamente deixar de seguir todas as contas que segue. Pode ser necessário executar o processo novamente após um intervalo de tempo devido aos limites de taxa.

# Problemas conhecidos e soluções:

### Não consigo colar o script:

  Seu navegador tenta te proteger de colar um script aleatório que você encontrou. Digite "allow pasting" (Firefox) ou "allow pasting" (Chrome) e pressione Enter para confirmar que você sabe o que está fazendo.

### A X Corp não está enviando minha exportação de dados:

Tente solicitar através do [Formulário de Privacidade](https://help.x.com/en/forms/privacy/request-account-info/me).

### Nem todos os Tweets foram removidos:

Verifique se o ID do Tweet restante está na sua exportação de dados. O script só pode excluir o que está no arquivo. Há uma opção para remover automaticamente os Tweets restantes nas "Opções Avançadas", mas ela é muito lenta. Se houver muitos Tweets, execute o script novamente. Talvez seja necessário solicitar uma nova exportação.

### Nenhum Tweet está visível no perfil mas a contagem de Tweets mostra que ainda há Tweets restantes:

Na maioria dos casos, esses são Retweets de Tweets de contas que foram desativadas ou banidas. Às vezes, os Tweets reaparecem quando as contas voltam, às vezes não. Não há nada que você possa fazer.

### As Curtidas não foram removidas:

Apenas as últimas poucas centenas podem ser removidas. Mesmo manualmente. Não há nada que você possa fazer, além de excluir sua conta inteira ou curtir Tweets para descurti-los depois, o que provavelmente fará com que sua conta seja bloqueada por spam.

### Navegador travando:

Isso acontece com mais frequência no Chrome e em navegadores baseados no Chrome. Especialmente ao remover mais de 15 mil Tweets. Fechar o console do navegador enquanto o script está rodando pode reduzir a possibilidade de falhas.

### Funcionou e você está agradecido:

Incrível. Compartilhe o script na plataforma que você estiver usando agora para dar aos outros a opção de excluir seus Tweets. Apoie o criador do script original: [buymeacoffee.com/lucahammer](https://www.buymeacoffee.com/lucahammer).
