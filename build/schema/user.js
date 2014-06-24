{{#block 'form/fieldset' Name <span>*</span> errors.name.message}}
	{{{block 'field/text' name ../user.name}}}
{{/block}}

{{#block 'form/fieldset' Slug <span>*</span> errors.slug.message}}
	{{{block 'field/text' slug ../user.slug}}}
{{/block}}

{{#block 'form/fieldset' Email <span>*</span> errors.email.message}}
	{{{block 'field/text' email ../user.email}}}
{{/block}}

{{#block 'form/fieldset' Password errors.password.message}}
	{{{block 'field/text' password ../user.password}}}
{{/block}}

{{#block 'form/fieldset' Birthdate errors.birthdate.message}}
	{{{block 'field/datetime' birthdate ../user.birthdate}}}
{{/block}}

{{#block 'form/fieldset' Gender errors.gender.message}}
	{{{block 'field/select' gender 'male|female|null' user.gender}}}
{{/block}}

{{#block 'form/fieldset' Website errors.website.message}}
	{{{block 'field/text' website ../user.website}}}
{{/block}}

{{#block 'form/fieldset' Phone errors.phone.message}}
	{{{block 'field/text' phone ../user.phone}}}
{{/block}}

{{#block 'form/fieldset'  errors..message}}
	{{{block 'field/'  ../user.}}}
{{/block}}

{{#block 'form/fieldset'  errors..message}}
	{{{block 'field/'  ../user.}}}
{{/block}}

{{#block 'form/fieldset'  errors..message}}
	{{{block 'field/'  ../user.}}}
{{/block}}

{{#block 'form/fieldset' Facebook errors.facebook.message}}
	{{{block 'field/text' facebook ../user.facebook}}}
{{/block}}

{{#block 'form/fieldset' Twitter errors.twitter.message}}
	{{{block 'field/text' twitter ../user.twitter}}}
{{/block}}

{{#block 'form/fieldset' Google errors.google.message}}
	{{{block 'field/text' google ../user.google}}}
{{/block}}

{{#block 'form/fieldset' Linkedin errors.linkedin.message}}
	{{{block 'field/text' linkedin ../user.linkedin}}}
{{/block}}

{{#block 'form/fieldset' Active errors.active.message}}
	{{{block 'field/radio' active ../user.active}}}
	{{{block 'field/radio' active ../user.active}}}
{{/block}}

