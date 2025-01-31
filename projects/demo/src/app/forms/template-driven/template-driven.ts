/*
 * Copyright (c) 2016-2023 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from '@angular/core';

@Component({
  templateUrl: './template-driven.html',
})
export class FormsTemplateDrivenDemo {
  model = {
    basic: '',
    container: '',
    required: '',
  };

  submit() {
    console.log(this);
  }
}
