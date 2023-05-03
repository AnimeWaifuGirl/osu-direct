$(document).ready(async () => {
  const teamList = $("#teamList");
  const fetchDiscordInfo = await fetch(`${apiUrl}/team`, {
    method: "POST"
  });
  const discordInfo = await fetchDiscordInfo.json();
  teamList.empty();
  if (discordInfo && discordInfo.length > 0) {
    let n = 0;
    for (const user of discordInfo) {
      addUserPanel(user, teamList, n);
      n++;
    }
  }
});

function addUserPanel(user, div, n) {
  const mainCard = $(`<div class="card animated slideSide" style="width: 350px; animation-delay: ${0.1 * n}s" />`);

  const mainCardHeader = $('<div class="card__container" />');
  mainCardHeader.append($(`<div class="card__image" style="background-image: url('${user.avatarUrl}');"></div>`));
  const mainCardHeaderTitle = $('<div class="card__title-container">');
  mainCardHeaderTitle.append($(`<p class="title light">${user.username}#${user.discriminator}</h3>`));
  mainCardHeaderTitle.append($(`<span class="subtitle light">${user.position}</span>`));
  mainCardHeader.append(mainCardHeaderTitle);
  mainCard.append(mainCardHeader);

  const mainCardBody = $('<div class="content u-text-center" style="padding: 0 1rem;" />');
  mainCardBody.append($(`<p>${user.bio}</p>`));
  mainCard.append(mainCardBody);

  const actions = $('<div class="card__action-bar u-center py-2" />');
  for (let [key, value] of entries(user.socials)) {
    actions.append($(`<a href="${value}" target="_blank" class="btn btn-dark">${capitalize(key)} Profile</a>`));
  }

  mainCard.append(actions);

  div.append(mainCard);
}

function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}