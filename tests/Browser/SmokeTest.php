<?php

it('has no smoke on key pages', function () {
    $pages = visit(['/', '/login', '/register']);

    $pages->assertNoSmoke();
});
