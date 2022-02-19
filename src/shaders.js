const PSXVert = `precision lowp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 color;

varying vec2 vUv;
varying vec3 vColor;

void main() {
    vUv = uv;
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 snapped = gl_Position;
    snapped.xyz = gl_Position.xyz / vec3(gl_Position.w);
    snapped.x = floor(160.0 * snapped.x) / 160.0;
    snapped.y = floor(120.0 * snapped.y) / 120.0;
    snapped.xyz = snapped.xyz * vec3(gl_Position.w);
    gl_Position = snapped;

    // o.uv_MainTex = TRANSFORM_TEX(v.texcoord, _MainTex);
    // o.uv_MainTex *= distance + (vertex.w*(UNITY_LIGHTMODEL_AMBIENT.a * 8)) / distance / 2;
    // o.normal = distance + (vertex.w*(UNITY_LIGHTMODEL_AMBIENT.a * 8)) / distance / 2;
}`

const PSXFrag = `precision lowp float;

uniform sampler2D map;
uniform vec3 tintColor;

varying vec2 vUv;
varying vec3 vColor;

const mat4 psxDitherTable = mat4(
    0,    8,    2,    10,
    12,    4,    14,    6, 
    3,    11,    1,    9, 
    15,    7,    13,    5
);

float getData(int x, int y) {
    for (int i = 0; i < 16; i++) {
        if (i == x) {
            for (int j = 0; j < 16; j++) {
                if (j == y) {
                    return psxDitherTable[i][j];
                }
            }
        }
    }
}

const int BIT_COUNT = 8;

int modi(int x, int y) {
    return x - y * (x / y);
}

int and(int a, int b) {
    int result = 0;
    int n = 1;

    for(int i = 0; i < BIT_COUNT; i++) {
        if ((modi(a, 2) == 1) && (modi(b, 2) == 1)) {
            result += n;
        }

        a = a / 2;
        b = b / 2;
        n = n * 2;

        if(!(a > 0 && b > 0)) {
            break;
        }
    }
    return result;
}

vec3 ditherCrunch(vec3 col, vec2 p) {
    col = col * vec3(255.0);

    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    float dither = getData(x, y);
    col = col + (dither / 2.0 - 4.0);

    col.r = mix(float(and(int(floor(col.r)), 248)), 248.0, step(248.0, col.r));
    col.g = mix(float(and(int(floor(col.g)), 248)), 248.0, step(248.0, col.g));
    col.b = mix(float(and(int(floor(col.b)), 248)), 248.0, step(248.0, col.b));

    col = col / vec3(255.0);

    return col;
}

void main() {
    vec4 diffuseColor = texture2D(map, vUv);//texture2D(psxDitherTable, vUv);//vec4(1.0);//
    diffuseColor.xyz = diffuseColor.xyz * vColor;
    diffuseColor.xyz = diffuseColor.xyz * tintColor;
    diffuseColor.xyz = ditherCrunch(diffuseColor.xyz, gl_FragCoord.xy);
    gl_FragColor = diffuseColor;
}`

export { PSXVert, PSXFrag }
