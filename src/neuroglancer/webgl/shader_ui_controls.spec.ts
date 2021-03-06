/**
 * @license
 * Copyright 2019 Google Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {parseShaderUiControls, stripComments} from 'neuroglancer/webgl/shader_ui_controls';


describe('stripComments', () => {
  it('handles code without comments', () => {
    const code = `int val;
void main() {
  int val2;
  int val2 = "string literal // here";
}
`;
    expect(stripComments(code)).toEqual(code);
  });

  it('handles // comments', () => {
    const original = `int val;
void main() {
  int val2; // comment at end of line
  int val2 = "string literal // here";
}
`;
    const stripped = `int val;
void main() {
  int val2;                          
  int val2 = "string literal // here";
}
`;
    expect(stripComments(original)).toEqual(stripped);
  });

  it('handles /* comments', () => {
    const original = `int val;
void main() {
  int val2; /* comment at end of line
  int val3; // continues here */
  int val2 = "string literal // here";
}
`;
    const stripped = `int val;
void main() {
  int val2;                          
                                
  int val2 = "string literal // here";
}
`;
    expect(stripComments(original)).toEqual(stripped);
  });
});

describe('parseShaderUiControls', () => {
  it('handles no controls', () => {
    const code = `
void main() {
  emitRGB(vec3(1.0, 1.0, 1.0));
}
`;
    expect(parseShaderUiControls(code)).toEqual({code, errors: [], controls: new Map()});
  });

  it('handles slider control', () => {
    const code = `
#uicontrol float brightness slider(min=0, max=1)
void main() {
  emitRGB(vec3(1.0, 1.0, 1.0));
}
`;
    const newCode = `

void main() {
  emitRGB(vec3(1.0, 1.0, 1.0));
}
`;
    expect(parseShaderUiControls(code)).toEqual({
      code: newCode,
      errors: [],
      controls: new Map([[
        'brightness', {type: 'slider', valueType: 'float', min: 0, max: 1, default: 0.5, step: 0.01}
      ]])
    });
  });

  it('handles color control', () => {
    const code = `
#uicontrol vec3 color color(default="red")
void main() {
  emitRGB(color);
}
`;
    const newCode = `

void main() {
  emitRGB(color);
}
`;
    expect(parseShaderUiControls(code)).toEqual({
      code: newCode,
      errors: [],
      controls: new Map(
          [['color', {type: 'color', valueType: 'vec3', default: 'red'}]])
    });
  });  
  
});
