document.addEventListener("DOMContentLoaded", function () {
  const likeBtn = document.getElementById("like-btn");
  const likeCount = document.getElementById("like-count");
  const likeText = document.getElementById("like-text");
  const commentForm = document.getElementById("comment-form");
  const commentsList = document.getElementById("comments-list");
  const mainElement = document.querySelector("main");
  const articleSlug = mainElement.dataset.articleslug;
  const isAuthenticated = mainElement.dataset.isAuthenticated === "true";

  // Função para formatar data
  function formatDate(dateString) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  // Like Button Logic
  if (likeBtn) {
    likeBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      if (!isAuthenticated) {
        window.location.href = "/app/auth/register";
        return;
      }

      const isLiked = likeBtn.dataset.isLiked === "true";
      const newIsLiked = !isLiked;

      try {
        const response = await fetch(`/app/article/${articleSlug}/like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(response);

        const data = await response.json();
        console.log(data);

        if (response.status === 401) {
          window.location.href = "/app/auth/login";
          return;
        }

        if (response.status === 201) {
          // Atualizar UI
          likeBtn.dataset.isLiked = newIsLiked;
          if (newIsLiked) {
            likeBtn.classList.add("filled");
            likeBtn.innerHTML = "♥";
          } else {
            likeBtn.classList.remove("filled");
            likeBtn.innerHTML = "♡";
          }

          // Atualizar contadores
          const newCount = newIsLiked
            ? parseInt(likeCount.textContent) + 1
            : parseInt(likeCount.textContent) - 1;
          likeCount.textContent = newCount + " curtidas";
          likeText.textContent = newCount + " curtidas";

          // Atualizar no DOM
          document.getElementById("like-count").textContent =
            newCount + " curtidas";
        }
      } catch (error) {
        console.error("Erro ao processar like:", error);
        alert("Erro ao processar curtida. Tente novamente.");
      }
    });
  }

  // Comment Form Logic
  if (commentForm) {
    commentForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const content = document.getElementById("comment-content").value;

      if (!content.trim()) {
        alert("Digite um comentário válido.");
        return;
      }

      try {
        const response = await fetch(`/app/article/${articleSlug}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post: content,
          }),
        });

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/app/auth/login";
          return;
        }

        if (response.ok && data.comment) {
          // Adicionar comentário na lista
          const commentItem = document.createElement("div");
          commentItem.className = "comment-item";
          commentItem.dataset.commentId = data.comment.id;
          commentItem.innerHTML = `
                            <div class="comment-header">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span class="comment-author">${data.comment.author}</span>
                                    <span class="comment-date">${formatDate(data.comment.creationDate)}</span>
                                </div>
                                <div class="comment-actions">
                                    <a class="comment-action-btn edit-comment-btn" data-comment-id="${data.comment.id}">Editar</a>
                                    <a class="comment-action-btn delete-comment-btn" data-comment-id="${data.comment.id}">Excluir</a>
                                </div>
                            </div>
                            <div class="comment-text">${data.comment.content}</div>
                            `;

          // Inserir no início da lista
          if (commentsList.querySelector(".no-comments")) {
            commentsList.innerHTML = "";
          }
          commentsList.insertBefore(commentItem, commentsList.firstChild);

          // Limpar formulário
          document.getElementById("comment-content").value = "";

          // Atualizar contador de comentários
          const currentCount = parseInt(
            document.getElementById("comment-count").textContent,
          );
          document.getElementById("comment-count").textContent =
            currentCount + 1 + " comentários";

          // Adicionar event listeners para os novos botões
          setupCommentButtons(commentItem);
        }
      } catch (error) {
        console.error("Erro ao postar comentário:", error);
        alert("Erro ao postar comentário. Tente novamente.");
      }
    });
  }

  // Setup event listeners para botões de editar/excluir
  function setupCommentButtons(commentItem) {
    const editBtn = commentItem.querySelector(".edit-comment-btn");
    const deleteBtn = commentItem.querySelector(".delete-comment-btn");

    if (editBtn) {
      editBtn.addEventListener("click", function () {
        const commentId = this.dataset.commentId;
        const commentText = commentItem.querySelector(".comment-text");
        const originalContent = commentText.textContent;

        // Criar textarea para edição
        const textarea = document.createElement("textarea");
        textarea.value = originalContent;
        textarea.className = "comment-input";
        textarea.style.minHeight = "60px";

        // Criar botões de salvar e cancelar
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Salvar";
        saveBtn.className = "comment-submit";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancelar";
        cancelBtn.className = "comment-action-btn";
        cancelBtn.style.marginLeft = "0.5rem";

        // Substituir conteúdo pelo textarea
        const tempDiv = document.createElement("div");
        tempDiv.style.display = "flex";
        tempDiv.style.flexDirection = "column";
        tempDiv.style.gap = "0.5rem";
        tempDiv.style.marginTop = "0.5rem";
        tempDiv.appendChild(textarea);

        const buttonsDiv = document.createElement("div");
        buttonsDiv.style.display = "flex";
        buttonsDiv.style.justifyContent = "flex-end";
        buttonsDiv.style.gap = "0.5rem";
        buttonsDiv.appendChild(saveBtn);
        buttonsDiv.appendChild(cancelBtn);
        tempDiv.appendChild(buttonsDiv);

        commentText.innerHTML = "";
        commentText.appendChild(tempDiv);

        // Focus no textarea
        textarea.focus();

        // Função para restaurar conteúdo original
        function restore() {
          commentText.textContent = originalContent;
        }

        // Cancelar
        cancelBtn.addEventListener("click", restore);

        // Salvar
        saveBtn.addEventListener("click", async function () {
          const newContent = textarea.value.trim();
          if (!newContent) {
            alert("Digite um comentário válido.");
            return;
          }

          try {
            const response = await fetch("/api/comments/update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                commentId: commentId,
                content: newContent,
              }),
            });

            if (response.ok) {
              commentText.textContent = newContent;
            } else {
              alert("Erro ao atualizar comentário.");
              restore();
            }
          } catch (error) {
            console.error("Erro ao atualizar comentário:", error);
            alert("Erro ao atualizar comentário.");
            restore();
          }
        });
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async function () {
        const commentId = this.dataset.commentId;

        if (!confirm("Tem certeza que deseja excluir este comentário?")) {
          return;
        }

        try {
          const response = await fetch("/api/comments/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              commentId: commentId,
            }),
          });

          if (response.ok) {
            // Remover comentário da UI
            commentItem.remove();

            // Atualizar contador
            const currentCount = parseInt(
              document.getElementById("comment-count").textContent,
            );
            document.getElementById("comment-count").textContent =
              currentCount - 1 + " comentários";

            // Se não tiver mais comentários
            if (commentsList.children.length === 0) {
              const noComments = document.createElement("p");
              noComments.className = "no-comments";
              noComments.textContent =
                "Nenhum comentário ainda. Seja o primeiro a comentar!";
              commentsList.appendChild(noComments);
            }
          } else {
            alert("Erro ao excluir comentário.");
          }
        } catch (error) {
          console.error("Erro ao excluir comentário:", error);
          alert("Erro ao excluir comentário.");
        }
      });
    }
  }

  // Adicionar event listeners para comentários existentes
  document.querySelectorAll(".comment-item").forEach((commentItem) => {
    setupCommentButtons(commentItem);
  });

  // Sincronizar com modo claro/escuro do header
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const body = document.body;

  function updateThemeForArticle(isDarkMode) {
    if (isDarkMode) {
      // Modo escuro já é o padrão
      document
        .querySelectorAll(
          ".like-button, .comment-button, .comment-action-btn, .comment-submit, .comment-input",
        )
        .forEach((el) => {
          el.style.color = "#fff";
        });
      document.querySelectorAll(".comment-input").forEach((el) => {
        el.style.background = "#1a1a1a";
        el.style.borderColor = "#706450";
      });
    } else {
      // Modo claro
      document
        .querySelectorAll(
          ".like-button, .comment-button, .comment-action-btn, .comment-submit",
        )
        .forEach((el) => {
          el.style.color = "#333";
        });
      document.querySelectorAll(".comment-input").forEach((el) => {
        el.style.background = "#fff";
        el.style.borderColor = "#ccc";
        el.style.color = "#333";
      });
    }
  }

  // Observar cliques no botão de tema do header
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === "style") {
        const computedStyle = window.getComputedStyle(body);
        const isDark =
          computedStyle.backgroundColor === "rgb(0, 0, 0)" ||
          computedStyle.backgroundColor === "";
        updateThemeForArticle(isDark);
      }
    });
  });

  observer.observe(body, { attributes: true });

  // Inicializar com tema atual
  const computedStyle = window.getComputedStyle(body);
  const isDark =
    computedStyle.backgroundColor === "rgb(0, 0, 0)" ||
    computedStyle.backgroundColor === "";
  updateThemeForArticle(isDark);
});
