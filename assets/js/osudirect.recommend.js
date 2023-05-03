let minStars = 1;
let maxStars = 10;

$(document).ready(async () => {
  $("#sidepanel-toggle").on("click", () => {
    $("#sidepanel").toggleClass("open");
  });
  $("#sidepanelClose").on("click", () => {
    $("#sidepanel").removeClass("open");
  });
  $(".sidepanel__main_dim").on("click", () => {
    $("#sidepanel").removeClass("open");
  });

  const queryParams = parseQueryParams();

  if ("mode" in queryParams) {
    const modes = queryParams.mode.split(",");
    for (let mode of modes) {
      const dataMode = $(`[data-mode="${mode}"]`);
      if (dataMode) {
        dataMode.attr("checked", true);
        dataMode.prop("checked", true);
      }
    }
  }

  if ("status" in queryParams) {
    const statuses = queryParams.status.split(",");
    for (let status of statuses) {
      const dataStatus = $(`[data-status="${status}"]`);
      if (dataStatus) {
        dataStatus.attr("checked", true);
        dataStatus.prop("checked", true);
      }
    }
  }

  if ("minStars" in queryParams) {
    if (/^\d+$/.test(queryParams.minStars)) {
      console.log("minStars: " + queryParams.minStars)
      minStars = queryParams.minStars;
      $("#starRange1").val(minStars);
    }else{
      console.log("minStars is not a number")
    }
  }

  if ("maxStars" in queryParams) {
    if (/^\d+$/.test(queryParams.maxStars)) {
      console.log("maxStars: " + queryParams.maxStars)
      maxStars = queryParams.maxStars;
      $("#starRange2").val(maxStars);
    }else {
      console.log("maxStars is not a number")
    }
  }


  const colors = [];
  const rainbow = new Rainbow();

  rainbow.setSpectrum('#AAAAAA', '#4698C4', '#4BC6A6', '#A3BD4F', '#C07E5A', '#BC476A', '#954496', '#5253AA', '#1D1D6B', '#0E1113', '#000000')
  rainbow.setNumberRange(0, 1000);
  for (var i = 0; i < 1000; i++) {
    colors.push(rainbow.colourAt(i));
  }

  const getDiffColor = (starDiff) => {
    starDiff = parseInt(starDiff * 100, 10);
    if (starDiff > colors.length) return colors[colors.length - 1];
    if (starDiff < 0) return colors[0];
    return colors[starDiff];
  }

  const addBeatmapCard = (beatmap, exactMapId, div, n) => {
    const mainCard = $(`<div class="card animated slideSide" style="overflow: visible; width: 420px; animation-delay: ${0.025 * n}s;" />`);

    const mainCardHeader = $(`<div class="card__container" style="min-height: 12rem; cursor: pointer;" />`);
    mainCardHeader.append($(`<div class="statusOverlay"><i class="fas ${rankedStatusesIcons[beatmap.RankedStatus]}"></i>${rankedStatuses[beatmap.RankedStatus]}</div>`));
    mainCardHeader.append($(`<div class="card__image" style="background-image: url('https://assets.ppy.sh/beatmaps/${beatmap.SetID}/covers/cover@2x.jpg'); background-position: center;"></div>`));
    const mainCardHeaderTitle = $('<div class="card__title-container">');
    const title = $(`<p class="title light mt-0"></h3>`);
    title.text(beatmap.Title);
    const subtitle = $(`<span class="subtitle light"></span>`);
    subtitle.text(beatmap.Artist);
    mainCardHeaderTitle.append(title);
    mainCardHeaderTitle.append(subtitle);
    mainCardHeader.append(mainCardHeaderTitle);
    mainCard.append(mainCardHeader);

    const mainCardBody = $('<div class="content u-text-center" style="padding: 0;" />');
    const beatmapDiffs = $('<div class="beatmapDiffs" />');

    const childrenBeatmaps = beatmap.ChildrenBeatmaps.sort((a, b) => {
      return a.DifficultyRating - b.DifficultyRating;
    });

    childrenBeatmaps.forEach((beatmapDiff) => {
      if (beatmapDiff.BeatmapID !== exactMapId) return;

      const diffColor = getDiffColor(beatmapDiff.DifficultyRating);

      let modeIcon = "mode-osu";

      switch (beatmapDiff.Mode) {
        case 1:
          modeIcon = "mode-taiko";
          break;
        case 2:
          modeIcon = "mode-catch";
          break;
        case 3:
          modeIcon = "mode-mania";
          break;
      }

      const beatmapDiffContainer = $(`<a class="tooltip text-white" href="https://osu.ppy.sh/b/${beatmapDiff.BeatmapID}" data-tooltip="(${beatmapDiff.DifficultyRating}⭐)[${beatmapDiff.DiffName}]" target="_blank"><i class="mode-icon ${modeIcon}" style="background-color: #${diffColor};"></i></a>`);
      beatmapDiffs.append(beatmapDiffContainer);
    });
    mainCardBody.append(beatmapDiffs);
    mainCard.append(mainCardBody);

    const actions = $('<div class="card__action-bar u-center py-2" />');
    actions.append($(`<a href="${apiUrl}/api/d/${beatmap.SetID}" class="btn btn-dark">Download</a>`));
    if (beatmap.HasVideo)
      actions.append($(`<a href="${apiUrl}/api/d/${beatmap.SetID}?noVideo" class="btn btn-dark">Download (no video)</a>`));

    mainCard.append(actions);

    const cardFooter = $('<div class="card__footer text-muted content" />');

    cardFooter.append($(`<div>Mapped by <a class="text-ctp-red" href="https://osu.ppy.sh/u/${beatmap.Creator}" target="_blank">${beatmap.Creator}</a></div>`));
    switch (beatmap.RankedStatus) {
      case 1:
        cardFooter.append($(`<div>Ranked at ${beatmap.ApprovedDate}</div>`));
        break;
      case 2:
        cardFooter.append($(`<div>Approved at ${beatmap.ApprovedDate}</div>`));
        break;
      case 3:
        cardFooter.append($(`<div>Qualified at ${beatmap.ApprovedDate}</div>`));
        break;
      case 4:
        cardFooter.append($(`<div>Loved at ${beatmap.ApprovedDate}</div>`));
        break;
      default:
        cardFooter.append($(`<div>Last update at ${beatmap.LastUpdate}</div>`));
        break;
    }

    mainCard.append(cardFooter);
    div.append(mainCard);
  }

  $("#minStars").on("change", () => {
    $("#minStarsLabel").text($("#minStars").val());
  });
  $("#maxStars").on("change", () => {
    $("#maxStarsLabel").text($("#maxStars").val());
  });
  const loadRecommended = async () => {
    const filtered_modes = [];
    if ($("#filter-mode-osu").is(":checked")) filtered_modes.push(0);
    if ($("#filter-mode-taiko").is(":checked")) filtered_modes.push(1);
    if ($("#filter-mode-catch").is(":checked")) filtered_modes.push(2);
    if ($("#filter-mode-mania").is(":checked")) filtered_modes.push(3);

    const filtered_status = [];
    if ($("#filter-status-ranked").is(":checked")) filtered_status.push(1);
    if ($("#filter-status-approved").is(":checked")) filtered_status.push(2);
    if ($("#filter-status-qualified").is(":checked")) filtered_status.push(3);
    if ($("#filter-status-loved").is(":checked")) filtered_status.push(4);
    if ($("#filter-status-pending").is(":checked")) filtered_status.push(0);
    if ($("#filter-status-wip").is(":checked")) filtered_status.push(-1);
    if ($("#filter-status-graveyard").is(":checked")) filtered_status.push(-2);

    let queryParams = `?minStars=${minStars}&maxStars=${maxStars}`;

    if (filtered_modes.length > 0) queryParams += `&mode=${filtered_modes.join(",")}`;

    if (filtered_status.length > 0) queryParams += `&status=${filtered_status.join(",")}`;

    console.log(queryParams);

    const randomBeatmap = await fetch(`${apiUrl}/api/recommend${queryParams}`);
    const beatmap = await randomBeatmap.json();
    console.log(beatmap);
    const fullSet = await fetch(`${apiUrl}/api/s/${beatmap.ParentSetID}`);
    const fullSetJson = await fullSet.json();
    $("#recommendedBeatmap").empty();
    console.log(beatmap);
    addBeatmapCard(fullSetJson, beatmap.BeatmapID, $("#recommendedBeatmap"), 0);
  }

  await loadRecommended();

  $("#filter-apply").on("click", async () => {
    minStars = Math.min($("#starRange1").val(), $("#starRange2").val());
    maxStars = Math.max($("#starRange1").val(), $("#starRange2").val());
    updatePath();
    await loadRecommended();
  });

  $("#sidepanel").toggleClass("open");
});

function updatePath() {
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;

    const filtered_modes = [];
    if ($("#filter-mode-osu").is(":checked")) filtered_modes.push(0);
    if ($("#filter-mode-taiko").is(":checked")) filtered_modes.push(1);
    if ($("#filter-mode-catch").is(":checked")) filtered_modes.push(2);
    if ($("#filter-mode-mania").is(":checked")) filtered_modes.push(3);

    const filtered_status = [];
    if ($("#filter-status-ranked").is(":checked")) filtered_status.push(1);
    if ($("#filter-status-approved").is(":checked")) filtered_status.push(2);
    if ($("#filter-status-qualified").is(":checked")) filtered_status.push(3);
    if ($("#filter-status-loved").is(":checked")) filtered_status.push(4);
    if ($("#filter-status-pending").is(":checked")) filtered_status.push(0);
    if ($("#filter-status-wip").is(":checked")) filtered_status.push(-1);
    if ($("#filter-status-graveyard").is(":checked")) filtered_status.push(-2);

    let queryParams = "";
    if (filtered_modes.length > 0)
      queryParams = "?mode=" + filtered_modes.join(",");

    if (filtered_status.length > 0)
      queryParams += `${queryParams.length <= 0 ? "?" : "&"}status=` + filtered_status.join(",");

    if (minStars != 0 || maxStars != 10)
      queryParams += `${queryParams.length <= 0 ? "?" : "&"}minStars=${minStars}&maxStars=${maxStars}`;


    window.history.pushState({ path: newurl + queryParams }, '', newurl + queryParams);
  }
}