document.addEventListener("DOMContentLoaded", function () {
  const likeBtn = document.getElementById("like-btn");
  const likeCount = document.getElementById("like-count");
  const likeText = document.getElementById("like-text");
  const commentForm = document.getElementById("comment-form");
  const commentsList = document.getElementById("comments-list");
  const mainElement = document.querySelector("main");
  const articleSlug = mainElement.dataset.articleslug;
  const isAuthenticated = mainElement.dataset.isAuthenticated === "true";

  // Container de erros para comentários
  let commentErrorContainer = null;

  // Criar container de erros se não existir
  function createErrorContainer() {
    if (commentErrorContainer) return;

    commentErrorContainer = document.createElement("div");
    commentErrorContainer.id = "comment-errors";
    commentErrorContainer.className = "error-container";

    // Estilos para o container de erros
    const style = document.createElement("style");
    style.textContent = `
          #comment-errors {
              color: #d32f2f;
              background-color: #ffebee;
              border: 1px solid #ef9a9a;
              border-radius: 4px;
              padding: 15px;
              margin-bottom: 20px;
              display: none;
          }
          #comment-errors ul {
              margin: 0;
              padding-left: 20px;
              list-style-type: disc;
          }
          #comment-errors li {
              margin: 5px 0;
          }
          #comment-errors.show {
              display: block;
          }
          .comment-input.error {
              border: 1px solid #d32f2f !important;
          }
      `;
    document.head.appendChild(style);

    // Insere antes do formulário de comentários
    if (commentForm && commentForm.parentNode) {
      commentForm.parentNode.insertBefore(commentErrorContainer, commentForm);
    }
  }

  // Função para exibir erros
  function displayCommentErrors(errors) {
    if (!commentErrorContainer) createErrorContainer();

    commentErrorContainer.innerHTML = "";

    if (!errors || errors.length === 0) {
      commentErrorContainer.classList.remove("show");
      return;
    }

    const ul = document.createElement("ul");
    errors.forEach((error) => {
      const li = document.createElement("li");
      li.textContent = error;
      ul.appendChild(li);
    });

    commentErrorContainer.appendChild(ul);
    commentErrorContainer.classList.add("show");

    // Scroll para os erros
    commentErrorContainer.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  // Função para limpar erros
  function clearCommentErrors() {
    if (!commentErrorContainer) return;

    commentErrorContainer.classList.remove("show");
    commentErrorContainer.innerHTML = "";

    // Remove classe error do textarea
    const textarea = document.getElementById("comment-content");
    if (textarea) {
      textarea.classList.remove("error");
    }
  }

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
      clearCommentErrors();

      const content = document.getElementById("comment-content").value;
      const textarea = document.getElementById("comment-content");

      // Validação cliente-side
      if (!content.trim()) {
        displayCommentErrors(["O comentário não pode ficar em branco"]);
        textarea.classList.add("error");
        return;
      }

      if (content.length > 2000) {
        displayCommentErrors([
          "O comentário deve ter no máximo 2000 caracteres",
        ]);
        textarea.classList.add("error");
        return;
      }

      if (content.length < 1) {
        displayCommentErrors(["O comentário deve ter pelo menos 1 caractere"]);
        textarea.classList.add("error");
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
          credentials: "include",
        });

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/app/auth/login";
          return;
        }

        if (!response.ok) {
          // Trata erros do backend
          let errorMessage = "Erro ao postar comentário";

          if (data.message) {
            const errorMessages = {
              "Invalid comment": "Digite um comentário válido.",
              "Slug inválido": "Artigo não encontrado.",
              "User not found": "Usuário não encontrado.",
              "Article not found": "Artigo não encontrado.",
              "Internal server error":
                "Erro interno do servidor. Tente novamente.",
              "Preencha o campo de comentário": "Digite um comentário válido.",
              "O comentário não pode ficar em branco":
                "O comentário não pode ficar em branco.",
              "O comentário deve ter pelo menos 1 caractere":
                "O comentário deve ter pelo menos 1 caractere.",
              "O comentário deve ter no máximo 2000 caracteres":
                "O comentário deve ter no máximo 2000 caracteres.",
            };

            errorMessage = errorMessages[data.message] || data.message;
          }

          displayCommentErrors([errorMessage]);
          textarea.classList.add("error");
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
          textarea.classList.remove("error");

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
        displayCommentErrors(["Erro ao postar comentário. Tente novamente."]);
        textarea.classList.add("error");
      }
    });
  }

  // Limpa erros ao digitar no textarea
  const commentTextarea = document.getElementById("comment-content");
  if (commentTextarea) {
    commentTextarea.addEventListener("input", function () {
      this.classList.remove("error");

      // Se não houver erros, esconde o container
      if (
        this.classList.contains("error") === false &&
        (!commentErrorContainer || commentErrorContainer.innerHTML === "")
      ) {
        clearCommentErrors();
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
            displayCommentErrors(["Digite um comentário válido."]);
            textarea.classList.add("error");
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
              credentials: "include",
            });

            if (!response.ok) {
              const errorData = await response.json();
              let errorMessage = "Erro ao atualizar comentário";

              if (errorData.message) {
                const errorMessages = {
                  "Invalid comment": "Digite um comentário válido.",
                  "Comment not found": "Comentário não encontrado.",
                  Unauthorized:
                    "Você não tem permissão para editar este comentário.",
                  "Internal server error":
                    "Erro interno do servidor. Tente novamente.",
                };
                errorMessage =
                  errorMessages[errorData.message] || errorData.message;
              }

              displayCommentErrors([errorMessage]);
              textarea.classList.add("error");
              return;
            }

            if (response.ok) {
              commentText.textContent = newContent;
              clearCommentErrors();
            } else {
              displayCommentErrors(["Erro ao atualizar comentário."]);
              textarea.classList.add("error");
              restore();
            }
          } catch (error) {
            console.error("Erro ao atualizar comentário:", error);
            displayCommentErrors(["Erro ao atualizar comentário."]);
            textarea.classList.add("error");
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
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = "Erro ao excluir comentário";

            if (errorData.message) {
              const errorMessages = {
                "Comment or user not found": "Comentário não encontrado.",
                "Invalid id": "ID inválido.",
                Unauthorized:
                  "Você não tem permissão para excluir este comentário.",
                "Internal server error":
                  "Erro interno do servidor. Tente novamente.",
              };
              errorMessage =
                errorMessages[errorData.message] || errorData.message;
            }

            displayCommentErrors([errorMessage]);
            return;
          }

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
            displayCommentErrors(["Erro ao excluir comentário."]);
          }
        } catch (error) {
          console.error("Erro ao excluir comentário:", error);
          displayCommentErrors(["Erro ao excluir comentário."]);
        }
      });
    }
  }

  // Adicionar event listeners para comentários existentes
  document.querySelectorAll(".comment-item").forEach((commentItem) => {
    setupCommentButtons(commentItem);
  });
});
