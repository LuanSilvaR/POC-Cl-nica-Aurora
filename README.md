# POC de gestão de estética

**Cadastro rápido — decisão atual:** na Agenda, o novo contato exige apenas nome e telefone com DDD e recebe a tag local Lead. Telefones iguais aos já cadastrados são recusados para evitar duplicidade. Bot, confirmação de telefone a cada contato e exigência de preenchimento da ficha completa após o primeiro agendamento ainda não estão implementados; regras e limites estão em `../docs/features/agendamento.md`.

**Agenda — revisão 19:** no encaixe, informe o horário exato desejado (ex.: 08:45) e a justificativa. O encaixe pode coincidir com atendimentos ou bloqueios e aparece destacado na agenda com badge próprio. Procedimentos disponíveis preenchem a duração cadastrada; “Customizado” informa duração apenas para aquele atendimento. Testes: `node tests/encaixe-customizado.cjs` e `node tests/procedimentos-bloqueios.cjs`. Disponibilidade segue local e demonstrativa.

**Agenda — revisão 14:** proposta inicial com visões de recepção/administração e médico, filtros de profissional/período/status, cadastro rápido e criação/alteração local. As configurações de horário do médico são gravadas como exemplo, mas ainda não restringem marcações. Perfis são simulações sem controle de acesso; dados de pacientes não estão integrados à outra tela. Consultar `../AGENDA-ANALISE.md` para itens pendentes.

**Entrada visual:** abra `login.html`. Para experimentar, use um e-mail válido e qualquer senha fictícia. A POC não verifica credenciais, não envia nem salva a senha e não protege rotas; não use dados reais. A saída leva de volta à entrada. `index.html` também pode ser aberto diretamente para acessar o protótipo. A imagem editorial está em `assets/`, sem dependência de rede. Validação: `node tests/login.cjs`.

**Menu — revisão 12:** o controle circular com setas fica na borda da barra, sem deslocar a logo. O sentido das setas e o rótulo do botão indicam recolher ou expandir. A preferência continua salva no navegador.

**Menu — revisão 11:** abre expandido por padrão em qualquer largura. Use o botão no topo do menu para recolher ou expandir; a preferência fica no navegador. Em celular, o menu aberto sobrepõe parte do conteúdo; recolhido, preserva um trilho de ícones. Os nomes aparecem no hover/foco e, em dispositivos de toque, sob os ícones. Teste opcional: `node tests/menu-colapsavel.cjs`.

**Revisão 10:** as ações ficam à direita dentro do container do título/descrição e usam ícones decorativos com texto acessível. Em telas estreitas, ocupam outra linha dentro do mesmo container.

**Revisão 09:** breadcrumb restaurado nas telas principais; nos detalhes, o link Configurações retorna ao hub. As ações permanecem alinhadas à direita.

**Apresentação atual (revisão 08):** ações alinhadas à direita, título/descrição em um container e conteúdo abaixo. Detalhes de configuração têm Voltar/Salvar no topo, sem breadcrumb ou banner técnico repetido. Ajuda de retenção fica junto do campo. Os limites da POC estão nesta documentação; retirar avisos da interface não torna os dados ou integrações reais. Teste: `node tests/cabecalhos.cjs`.

**Configurações — proposta atual:** abra `configuracoes.html`. O hub contém os quatro grupos e 13 opções da referência informada para Farias Rocha, com busca e detalhes separados em `configuracao.html?secao=...`. Não há formulário no hub nem segundo menu lateral nos detalhes. Integrações são apenas rascunhos; não conectam serviços nem coletam segredos reais. O layout anterior fica em `configuracoes-anterior.html` para comparação. Documento: `../HUB-CONFIGURACOES.md`; verificação: `node tests/configuracoes-hub.cjs`.

**MENU-01:** concluído conforme a revisão 11; histórico e validação em `../FILA-AJUSTES.md`.

Abra `index.html` diretamente no navegador. Não há instalação, build, servidor ou dependência externa.

Para discutir as três propostas de Visão geral, abra `visoes-gerais.html`. Há rascunhos distintos para administrador, recepcionista e médico, cenários de carregamento/vazio/erro e botões que explicam o fluxo esperado. Nenhum desses botões grava operações clínicas ou financeiras. Histórias e critérios em `../HISTORIAS.md`.

A página inicial agora usa a visão do **administrador**, com indicadores e alertas fictícios. Todas as telas têm alternância de tema no cabeçalho. “Sair do sistema”, no canto superior direito, encerra apenas a demonstração nesta aba após confirmação; `saida.html` permite entrar novamente. Tema e marca salvos permanecem. Não há autenticação real nem alteração de sessão do CRM original. Se sessionStorage for bloqueado, o marcador de saída pode não persistir. Teste adicional opcional: `node tests/tema-saida.cjs` (usa a instalação Playwright do CRM original).

**Revisão atual:** clique no avatar `RM`, no canto superior direito, para abrir o menu do usuário. Dentro dele ficam a identificação fictícia, a alternância de tema com sol/lua e “Sair do sistema”. O fundo escuro usa os tokens quase pretos do legado, substituindo a versão esverdeada. Use setas para percorrer as ações e Esc para fechar; clique fora também fecha. Na tela de saída o tema continua disponível sem menu de usuário conectado. Verificação específica: `node tests/menu-legado.cjs`.

**Saudação atual:** “Olá, Rafael”, com a data do dia calculada no carregamento em português e fuso de São Paulo. A conta fictícia do menu é Rafael Mendes (avatar `RM`), compartilhada com a saudação. O link de comparação de perfis fica ao final da Visão geral. Indicadores continuam sendo exemplos estáticos, independentemente da data do cabeçalho.

**Etapa atual: base, Visão geral e configurações locais.** Sete destinos navegáveis, shell responsivo, painel administrativo ilustrativo e nove seções de configuração. Agenda, cadastro de pacientes, prontuário, pacotes e financeiro transacional ainda são telas de etapa pendente.

Configurações permite salvar a identidade neste navegador. PNG/JPG/WebP de até 1 MB; a logo não é enviada a servidor. `localStorage` pode ser limitado em modo privado ou `file://`; nesse caso, a página informa a impossibilidade de persistência. O armazenamento é específico do navegador/origem; não contém dados reais.

Use `/` para buscar uma área, Tab/Shift+Tab para navegar e Esc para fechar diálogos/menu móvel. Em tablet, os ícones mantêm rótulos acessíveis. Atalho `N` será implementado junto às ações de criação.

A prévia de documento acompanha a marca salva; não é documento emitido, assinatura eletrônica ou integração de WhatsApp. Os valores e pacientes da visão geral são ilustrativos.

Documentação: `../ANALISE.md`, `../PROPOSTA.md`, `../PLANO-POC.md`. Validação utilitária opcional: `node tests/contraste.cjs`.

**Configurações ampliadas:** dados da clínica, conta, equipe, agenda/salas, comunicação, catálogo financeiro, modelos, marca e inventário de segurança/integrações. Abra `configuracoes.html#marca` para a identidade. Tudo é salvo localmente; nenhuma conexão com o CRM. Nome da conta atualiza menu/saudação e fuso da clínica atualiza a data da inicial. Idioma, moeda e regras operacionais são preferências demonstrativas.

**Paleta:** escolher uma cor gera 11 tons. Salvar aplica a botões, menus ativos/hover, ícones, foco e destaques em todas as páginas e temas. Cores claras são aceitas com textos adaptados; status semânticos permanecem independentes. Rotina OKLCh adaptada sob MIT, licença em `third_party/DeskcommCRM-LICENSE.txt`; sem dependência externa de execução. Fontes e limites em `../CONFIGURACOES-LEGADO.md`; histórias CFG-01/CFG-02.

Verificações opcionais: `node tests/paleta.cjs` (apenas Node) e `node tests/configuracoes.cjs` (Playwright instalado no CRM de origem).

