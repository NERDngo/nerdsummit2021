// Call to function with anonymous callback
loadJSON(function (response) {
	//  COMMENT THIS OUT TO GO LIVE WITH SESSIONS
	// if (!window.location.href.includes("dev.html")) {
	//     $(".timeslots").remove();
	//     return null;
	// }
	const rows = massageData(JSON.parse(response).values);
	const day1 = rows.filter((row) => row.day === "1");
	const day2 = rows.filter((row) => row.day === "2");
	createSessionList("Day-1", day1);
	createSessionList("Day-2", day2);

	var hash = window.location.hash;
	if (hash) {
		var $session = $(hash);
		if (!$session.length) {
			return;
		}
		$session.click();
		$("html, body").animate(
			{
				scrollTop: $session.offset().top - 120, //Minus header + shadow
			},
			300
		);
	}
});

// see https://stackoverflow.com/a/34908037/5855010  (original link for how to do this)
function loadJSON(callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	// 2022 - using 2021 sheet for testing, will create 2022 sheet later
	// this seems to work but is in a different format so parsing needs to change
	xobj.open("GET", "/data/sessions2021.json", true);

	// 2022 NOTES
	// shifting to locally saved file.j
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// .open will NOT return a value but simply returns undefined in async mode so use a callback
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}

function massageData(array) {
	const keys = array[0];
	const rawRows = array.slice(1, array.length);

	const rows = rawRows.map(valuesToObject);
	function valuesToObject(rawRow) {
		return keys.reduce(
			(acc, key, index) => ((acc[key] = rawRow[index]), acc),
			{}
		);
	}

	return rows;
}

function createSessionList(dayId, sessions) {
	const dayElement = document.querySelector(`#${dayId}`);
	if (!dayElement) {
		return;
	}
	sessions.forEach((session) => {
		let sessionElement = document.createElement("div");
		sessionElement.className = `session #${session.start}`;
		sessionElement.innerHTML = sessionTemplate(session);

		dayElement.appendChild(sessionElement);
	});

	function sessionTemplate(session) {
		const speakerLink = session.speakerLink
			? `<a href="${session.speakerLink}" class="speaker-link">Link to speaker info</a>`
			: null;
		const slideLink = session.slideLink
			? `<a href="${session.slideLink}" class="slides-link">Link to slides</a>`
			: null;
		const seperator =
			session.slideLink && session.speakerLink ? `<span> | </span>` : null;
		return sanitize`
        <div class="top" id="${session.id}">
            <div class="top-content">
                <div class="title"><h4 class="name">${session.name}</h4></div>
                <p class="speaker">${session.speaker}</p>
                <div class="time"> ${session.start} - ${session.end} </div>
                <div class="room">${session.room} </div>
                <div class="tags">${session.type} </div>
            </div>
            <div class="top-control">
                <a href="#${session.id}" onClick="function(e) {e.preventDefault(); return false;}"><span class="plus">+</span><span class="minus hide">-</span></a>
            </div>
        </div>
        <div class="info">
            ${speakerLink}
            ${seperator}
            ${slideLink}
            <p>${session.description}</p>
        </div>
        `;
	}

	function sanitize(strings, ...values) {
		const dirty = strings.reduce((prev, next, i) => {
			return `${prev}${next}${DOMPurify.sanitize(values[i])}`;
		}, "");
		return dirty;
	}
}
