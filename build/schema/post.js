{{#block 'form/fieldset' Slug <span>*</span> errors.slug.message}}
	{{{block 'field/text' slug ../post.slug}}}
{{/block}}

{{#block 'form/fieldset' Title <span>*</span> errors.title.message}}
	{{{block 'field/text' title ../post.title}}}
{{/block}}

{{#block 'form/fieldset' Detail <span>*</span> errors.detail.message}}
	{{{block 'field/textarea' detail ../post.detail}}}
{{/block}}

{{#block 'form/fieldset'  errors..message}}
	{{{block 'field/'  ../post.}}}
{{/block}}

{{#block 'form/fieldset' Status errors.status.message}}
	{{{block 'field/select' status 'draft|review|published' post.status}}}
{{/block}}

{{#block 'form/fieldset' Visibility errors.visibility.message}}
	{{{block 'field/select' visibility 'public|private' post.visibility}}}
{{/block}}

{{#block 'form/fieldset' Active errors.active.message}}
	{{{block 'field/radio' active ../post.active}}}
	{{{block 'field/radio' active ../post.active}}}
{{/block}}

{{#block 'form/fieldset' Published errors.published.message}}
	{{{block 'field/text' published ../post.published}}}
{{/block}}

